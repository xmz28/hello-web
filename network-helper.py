"""Loopback-only dashboard server and Windows tracert bridge (Python stdlib)."""
import argparse
import concurrent.futures
import ipaddress
import json
import os
from pathlib import Path
import re
import secrets
import socket
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HELPER_VERSION = 2


def choose_web_root(executable, bundled):
    """Use nearby project files when running the downloaded build in this repo."""
    for candidate in [Path(executable).resolve().parent, Path(executable).resolve().parent.parent]:
        if all((candidate / name).is_file() for name in ["dashboard.html", "network-tools.js", "network-helper.py"]):
            return candidate
    return Path(bundled)


FROZEN = bool(getattr(sys, "frozen", False))
BUNDLED_ROOT = Path(sys._MEIPASS) / "web" if FROZEN else Path(__file__).resolve().parent
ROOT = choose_web_root(sys.executable, BUNDLED_ROOT) if FROZEN else BUNDLED_ROOT
PAGE_SOURCE = "bundled" if FROZEN and ROOT == BUNDLED_ROOT else "project"
TOKEN = secrets.token_urlsafe(32)
JOBS = {}
LOCK = threading.RLock()
GEO_POOL = concurrent.futures.ThreadPoolExecutor(max_workers=4)
GEO_CACHE = {}


def normalize_target(value):
    if not isinstance(value, str) or not value.strip() or len(value) > 2048:
        raise ValueError("请输入域名或 IP")
    value = value.strip()
    if any(ord(c) < 33 for c in value):
        raise ValueError("地址不能包含空格或控制字符")
    if "://" in value:
        url = urllib.parse.urlsplit(value)
        if url.scheme not in ("http", "https") or url.username or url.password or not url.hostname:
            raise ValueError("只支持 HTTP/HTTPS 网站地址、域名或 IP")
        value = url.hostname
    value = value.removeprefix("[").removesuffix("]")
    try:
        return str(ipaddress.ip_address(value))
    except ValueError:
        pass
    value = value.rstrip(".").encode("idna").decode("ascii").lower()
    if len(value) > 253 or not all(re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label) for label in value.split(".")):
        raise ValueError("域名格式不正确")
    return value


def parse_hop(line):
    match = re.match(r"^\s*(\d+)\s+(.+)$", line.strip())
    if not match:
        return None
    tail = match.group(2)
    timings = re.findall(r"(<\s*\d+|\d+)\s*(?:ms|毫秒)|([*])", tail, re.I)
    if len(timings) < 3:
        return None
    samples = [(a.replace(" ", "") + " ms") if a else "*" for a, star in timings[:3]]
    address = None
    for part in tail.split():
        try:
            address = str(ipaddress.ip_address(part.strip("[]")))
        except ValueError:
            continue
    return {"hop": int(match.group(1)), "ip": address, "rtt": samples, "geo": None}


def get_geo(address):
    ip = ipaddress.ip_address(address)
    if not ip.is_global:
        return {"location": "本地 / 保留地址", "org": "", "source": "地址范围", "lat": None, "lon": None}
    with LOCK:
        cached = GEO_CACHE.get(address)
        if cached and time.time() - cached[0] < 86400:
            return cached[1]
    result = None
    for source, url in [("IPinfo", f"https://ipinfo.io/{address}/json"), ("ipwho.is", f"https://ipwho.is/{address}")]:
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "PersonalDashboard/1.0"})
            with urllib.request.urlopen(request, timeout=4) as response:
                data = json.load(response)
            if source == "IPinfo":
                if data.get("bogon") or not data.get("country"):
                    continue
                coords = data.get("loc", "").split(",")
                lat, lon = (float(coords[0]), float(coords[1])) if len(coords) == 2 else (None, None)
                result = {"location": " · ".join(filter(None, [data.get("country"), data.get("region"), data.get("city")])), "org": data.get("org", ""), "lat": lat, "lon": lon, "source": source}
            else:
                if data.get("success") is False or not data.get("country"):
                    continue
                result = {"location": " · ".join(filter(None, [data.get("country"), data.get("region"), data.get("city")])), "org": data.get("connection", {}).get("isp", ""), "lat": data.get("latitude"), "lon": data.get("longitude"), "source": source}
            break
        except (OSError, ValueError, KeyError):
            continue
    result = result or {"location": "归属地查询失败", "org": "", "lat": None, "lon": None, "source": ""}
    with LOCK:
        if len(GEO_CACHE) >= 512:
            GEO_CACHE.clear()
        GEO_CACHE[address] = (time.time(), result)
    return result


def trace_worker(job):
    process = None
    timer = None
    futures = []
    try:
        family = {"4": socket.AF_INET, "6": socket.AF_INET6, "auto": socket.AF_UNSPEC}[job["family"]]
        resolved = socket.getaddrinfo(job["target"], None, family, socket.SOCK_DGRAM)
        # Prefer IPv4 for a hostname in auto mode; IPv6 literals still stay IPv6.
        resolved.sort(key=lambda entry: entry[0] != socket.AF_INET)
        address = resolved[0][4][0]
        with LOCK:
            job["destination"] = address
            if job["cancelled"]:
                job["status"] = "cancelled"
                return
        executable = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "System32" / "tracert.exe"
        if not executable.is_file():
            raise RuntimeError("本地助手需要 Windows 的 tracert.exe")
        args = [str(executable), "-d", "-h", str(job["maxHops"]), "-w", "800", "-6" if ":" in address else "-4", address]
        process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=False,
                                   creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        with LOCK:
            job["process"] = process
            if job["cancelled"]:
                process.kill()
        def deadline():
            with LOCK:
                job["timedOut"] = True
            if process.poll() is None:
                process.kill()
        timer = threading.Timer(100, deadline)
        timer.start()
        for raw in iter(process.stdout.readline, b""):
            # The numeric IP and RTT tokens are ASCII even on Chinese Windows.
            hop = parse_hop(raw.decode("mbcs" if os.name == "nt" else "utf-8", errors="replace"))
            if hop:
                with LOCK:
                    job["hops"].append(hop)
                if hop["ip"]:
                    future = GEO_POOL.submit(get_geo, hop["ip"])
                    def attach(done, row=hop):
                        try:
                            geo = done.result()
                        except Exception:
                            geo = {"location": "归属地查询失败", "lat": None, "lon": None}
                        with LOCK:
                            row["geo"] = geo
                    future.add_done_callback(attach)
                    futures.append(future)
        process.wait()
        timer.cancel()
        with LOCK:
            job["status"] = "locating" if not job["cancelled"] else "cancelled"
        concurrent.futures.wait(futures, timeout=12)
        with LOCK:
            if job["cancelled"]:
                job["status"] = "cancelled"
            else:
                reached = any(row["ip"] == address for row in job["hops"])
                job["status"] = "completed" if reached else "partial"
                job["message"] = "已到达目标" if reached else ("探测超时，保留已收到的跳点" if job["timedOut"] else "目标未响应或达到跳数上限，保留已收到的跳点")
    except Exception as error:
        with LOCK:
            job["status"] = "cancelled" if job["cancelled"] else "error"
            job["message"] = str(error)
    finally:
        if timer:
            timer.cancel()
        if process and process.poll() is None:
            process.kill()
        with LOCK:
            job.pop("process", None)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass

    def end_headers(self):
        # Project edits should appear on the next refresh, including CSS and JS.
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def allowed(self):
        port = self.server.server_port
        hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
        return (self.headers.get("Host") in hosts and self.headers.get("Sec-Fetch-Site") != "cross-site"
                and self.headers.get("Origin", f"http://127.0.0.1:{port}") in {f"http://{host}" for host in hosts})

    def reply(self, status, data):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(raw)

    def do_GET(self):
        if not self.allowed():
            return self.reply(403, {"error": "仅允许本地面板访问"})
        path = urllib.parse.urlsplit(self.path).path
        if path == "/api/network/health":
            return self.reply(200, {"name": "personal-network-helper", "version": HELPER_VERSION, "portable": FROZEN, "pageSource": PAGE_SOURCE, "token": TOKEN})
        if path.startswith("/api/network/traces/"):
            if self.headers.get("X-Network-Token") != TOKEN:
                return self.reply(403, {"error": "会话无效"})
            with LOCK:
                job = JOBS.get(path.rsplit("/", 1)[-1])
                if not job:
                    return self.reply(404, {"error": "任务不存在"})
                return self.reply(200, {k: v for k, v in job.items() if k != "process"})
        if path.startswith("/api/"):
            return self.reply(404, {"error": "接口不存在"})
        resolved = Path(self.translate_path(path)).resolve()
        if not resolved.is_relative_to(ROOT) or any(part.startswith(".") for part in resolved.relative_to(ROOT).parts) or resolved.suffix.lower() in {".py", ".cmd"}:
            return self.reply(403, {"error": "禁止访问"})
        if path == "/dashboard.html":
            page = resolved.read_text(encoding="utf-8")
            def version_asset(match):
                attribute, url = match.groups()
                parsed = urllib.parse.urlsplit(url)
                asset = (ROOT / parsed.path).resolve()
                if not parsed.scheme and not parsed.netloc and asset.is_relative_to(ROOT) and asset.is_file() and asset.suffix in {".css", ".js"}:
                    url += ("&" if parsed.query else "?") + f"helperrev={asset.stat().st_mtime_ns}"
                return f'{attribute}="{url}"'
            page = re.sub(r'(src|href)="([^"]+)"', version_asset, page)
            raw = page.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(raw)
            return
        if self.command == "HEAD":
            super().do_HEAD()
        else:
            super().do_GET()

    def list_directory(self, path):
        self.send_error(403)
        return None

    def do_HEAD(self):
        # Use the same path and host checks as GET instead of inherited access.
        self.do_GET()

    def do_POST(self):
        if not self.allowed() or self.headers.get("X-Network-Token") != TOKEN:
            return self.reply(403, {"error": "仅允许本地面板会话访问"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            if not 0 < length <= 4096 or self.headers.get("Content-Type", "").split(";")[0] != "application/json":
                raise ValueError("请求格式不正确")
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError("请求格式不正确")
            path = urllib.parse.urlsplit(self.path).path
            if path == "/api/network/shutdown":
                self.reply(200, {"ok": True})
                threading.Thread(target=self.server.shutdown, daemon=True).start()
                return
            if path == "/api/network/traces":
                target = normalize_target(data.get("target"))
                family = str(data.get("family", "auto"))
                max_hops = data.get("maxHops", 30)
                if family not in {"auto", "4", "6"} or type(max_hops) is not int or not 1 <= max_hops <= 30:
                    raise ValueError("协议或跳数不正确")
                with LOCK:
                    if any(job["status"] in {"running", "locating"} for job in JOBS.values()):
                        return self.reply(409, {"error": "已有追踪任务运行中"})
                    while len(JOBS) >= 20:
                        JOBS.pop(next(iter(JOBS)))
                    job = {"id": secrets.token_hex(8), "target": target, "family": family, "maxHops": max_hops,
                           "status": "running", "destination": "", "hops": [], "message": "", "cancelled": False, "timedOut": False}
                    JOBS[job["id"]] = job
                threading.Thread(target=trace_worker, args=(job,), daemon=True).start()
                return self.reply(202, {"id": job["id"]})
            if path.endswith("/cancel") and path.startswith("/api/network/traces/"):
                with LOCK:
                    job = JOBS.get(path.split("/")[-2])
                    if not job:
                        return self.reply(404, {"error": "任务不存在"})
                    job["cancelled"] = True
                    process = job.get("process")
                    if process and process.poll() is None:
                        process.kill()
                return self.reply(200, {"ok": True})
            return self.reply(404, {"error": "接口不存在"})
        except (ValueError, UnicodeError, TypeError) as error:
            return self.reply(400, {"error": str(error)})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--launch", action="store_true")
    parser.add_argument("--stop", action="store_true")
    parser.add_argument("--serve", action="store_true", help="运行本地服务（免安装版本内部使用）")
    parser.add_argument("--no-browser", action="store_true", help="启动助手但不自动打开浏览器")
    args = parser.parse_args()
    base = f"http://127.0.0.1:{args.port}"
    def health():
        with urllib.request.urlopen(base + "/api/network/health", timeout=1) as response:
            data = json.load(response)
        if data.get("name") != "personal-network-helper":
            raise RuntimeError("端口已被其他服务占用")
        return data
    if args.stop:
        info = health()
        request = urllib.request.Request(base + "/api/network/shutdown", data=b"{}", headers={"Content-Type": "application/json", "X-Network-Token": info["token"]})
        urllib.request.urlopen(request, timeout=3).close()
        return
    if args.launch or (getattr(sys, "frozen", False) and not args.serve):
        try:
            info = health()
            if info.get("version") != HELPER_VERSION or info.get("pageSource") != PAGE_SOURCE:
                request = urllib.request.Request(base + "/api/network/shutdown", data=b"{}", headers={"Content-Type": "application/json", "X-Network-Token": info["token"]})
                urllib.request.urlopen(request, timeout=3).close()
                for _ in range(30):
                    time.sleep(.1)
                    try:
                        health()
                    except OSError:
                        break
                else:
                    raise RuntimeError("旧助手未退出，请先在旧面板点击退出本地助手")
                raise OSError("Start the updated helper")
        except OSError:
            command = [sys.executable, "--serve", "--port", str(args.port)] if getattr(sys, "frozen", False) else [sys.executable, str(Path(__file__).resolve()), "--port", str(args.port)]
            child_env = dict(os.environ)
            if getattr(sys, "frozen", False):
                # The detached onefile server must own its unpacked resources.
                child_env["PYINSTALLER_RESET_ENVIRONMENT"] = "1"
            subprocess.Popen(command,
                             env=child_env, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0), stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            for _ in range(150):
                time.sleep(.1)
                try:
                    health()
                    break
                except OSError:
                    continue
            else:
                raise RuntimeError("助手启动失败，请检查端口或直接运行 network-helper.py")
        if not args.no_browser:
            webbrowser.open(base + f"/dashboard.html?helper={HELPER_VERSION}")
        return
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    if sys.stdout:
        print(f"Network dashboard: {base}/dashboard.html", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        with LOCK:
            for job in JOBS.values():
                job["cancelled"] = True
                process = job.get("process")
                if process and process.poll() is None:
                    process.kill()
        server.server_close()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        if getattr(sys, "frozen", False) and os.name == "nt":
            import ctypes
            ctypes.windll.user32.MessageBoxW(None, str(error), "网络路由助手启动失败", 0x10)
            sys.exit(1)
        raise
