"""Build the self-contained visitor download on Windows using PyInstaller."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
build = root / ".network-helper-build"
web = build / "web"
web.mkdir(parents=True, exist_ok=True)
python_license = Path(sys.base_prefix) / "LICENSE.txt"
if not python_license.is_file():
    raise RuntimeError("找不到 Python 运行环境许可证，请使用官方 Windows Python 构建")
shutil.copy2(python_license, web / "LICENSE-Python.txt")
files = ["dashboard.html", "theme-init.js", "style.css", "remixicon.css", "remixicon.woff2", "interface-copy.js", "site.js", "network-checks.js", "network-tools.js", "site-widgets.js", "updates.json", "assets/images/2.jpg"]
for name in files:
    output = web / name
    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, output)
shutil.copytree(root / "assets/vendor/leaflet", web / "assets/vendor/leaflet", dirs_exist_ok=True)
dashboard = (web / "dashboard.html").read_text(encoding="utf-8")
# The portable package contains the dashboard, so avoid dead links to other pages.
dashboard = re.sub(r'^.*class="nav-link(?! active).*\n', '', dashboard, flags=re.M)
dashboard = dashboard.replace('href="index.html" class="profile-brand"', 'href="dashboard.html" class="profile-brand"')
dashboard = re.sub(r'^.*<article class="dash-card launchers">.*\n', '', dashboard, flags=re.M)
dashboard = dashboard.replace('href="downloads/NetworkRouteHelper-Windows-x64.exe" download', 'href="#routeHelp"')
dashboard = dashboard.replace('下载路由助手 · Windows 免安装', '你正在使用免安装路由助手')
(web / "dashboard.html").write_text(dashboard, encoding="utf-8")
downloads = root / "downloads"
downloads.mkdir(exist_ok=True)
subprocess.run([sys.executable, "-m", "PyInstaller", "--noconfirm", "--onefile", "--windowed",
                "--name", "NetworkRouteHelper-Windows-x64", "--distpath", str(downloads), "--workpath", str(build / "work"),
                "--specpath", str(build), "--add-data", f"{web};web", str(root / "network-helper.py")], check=True, cwd=root)
binary = downloads / "NetworkRouteHelper-Windows-x64.exe"
data = binary.read_bytes()
digest = hashlib.sha256(data).hexdigest()
for stale in downloads.glob(f"{binary.name}.part*"):
    stale.unlink()
parts = []
chunk_size = 2 * 1024 * 1024
for index, offset in enumerate(range(0, len(data), chunk_size), 1):
    name = f"{binary.name}.part{index:02d}"
    chunk = data[offset:offset + chunk_size]
    (downloads / name).write_bytes(chunk)
    parts.append({"name": name, "bytes": len(chunk)})
(downloads / "NetworkRouteHelper-Windows-x64.sha256").write_text(f"{digest}  {binary.name}\n", encoding="ascii", newline="\n")
(downloads / "network-helper-release.json").write_text(json.dumps({"version": "1.1.1", "platform": "Windows x64", "bytes": len(data), "sha256": digest, "parts": parts}, indent=2), encoding="utf-8", newline="\n")
print(f"Built {binary.name}: {binary.stat().st_size / 1024 / 1024:.1f} MiB, SHA256 {digest}")
