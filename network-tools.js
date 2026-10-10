function setupNetworkTools() {
    setupInternationalSpeed();
    setupRouteDownload();
    setupRouteTool();
}

function setupRouteDownload() {
    const button = document.getElementById("routeDownload");
    if (!button || button.getAttribute("href") === "#routeHelp") return; // The portable helper already contains the dashboard.
    button.addEventListener("click", async event => {
        event.preventDefault();
        if (button.dataset.busy === "true") return;
        button.dataset.busy = "true";
        const original = "下载路由助手 · Windows 免安装";
        let completed = false;
        try {
            const metadataResponse = await fetch("downloads/network-helper-release.json", { cache: "no-store" });
            if (!metadataResponse.ok) throw new Error("无法读取下载清单");
            const release = await metadataResponse.json();
            if (!Array.isArray(release.parts) || !release.parts.length) throw new Error("下载清单缺少文件分片");
            const parts = [];
            for (const [index, part] of release.parts.entries()) {
                button.textContent = `正在下载 ${index + 1}/${release.parts.length}…`;
                const response = await fetch(`downloads/${encodeURIComponent(part.name)}`, { cache: "no-store" });
                if (!response.ok) throw new Error(`第 ${index + 1} 段下载失败`);
                const data = await response.arrayBuffer();
                if (data.byteLength !== part.bytes) throw new Error(`第 ${index + 1} 段大小不符`);
                parts.push(data);
            }
            button.textContent = "正在校验文件…";
            const blob = new Blob(parts, { type: "application/octet-stream" });
            if (blob.size !== release.bytes) throw new Error("文件总大小不符");
            const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer())), byte => byte.toString(16).padStart(2, "0")).join("");
            if (hash !== release.sha256) throw new Error("SHA256 校验失败");
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url; link.download = "NetworkRouteHelper-Windows-x64.exe";
            document.body.appendChild(link); link.click(); link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            button.textContent = "下载完成，双击运行助手";
            completed = true;
        } catch (error) {
            button.textContent = `下载失败：${error.message}，点击重试`;
        } finally {
            button.dataset.busy = "false";
            if (completed) setTimeout(() => { if (button.dataset.busy !== "true") button.textContent = original; }, 6000);
        }
    });
}

function setupInternationalSpeed() {
    const button = document.getElementById("speedStart");
    const select = document.getElementById("speedNode");
    if (!button) return;
    const nodes = {
        tokyo: "https://librespeed.a573.net/backend/",
        la: "https://la.speedtest.clouvider.net/backend/"
    };
    let running = false, stopped = false, phaseController, transferred = 0;
    let samples = [];
    const mib = 1024 * 1024;
    function traffic(bytes) {
        transferred += bytes;
        setText("speedTraffic", (transferred / mib).toFixed(1));
    }
    function chart(value) {
        samples.push(value);
        const max = Math.max(1, ...samples);
        document.getElementById("speedCurve").setAttribute("d", samples.map((v, i) => `${i ? "L" : "M"}${i * 800 / Math.max(1, samples.length - 1)},${98 - v / max * 90}`).join(" "));
    }
    function url(base, path, params = {}) {
        const result = new URL(path, base);
        result.search = new URLSearchParams({ cors: "true", r: String(Math.random()), ...params });
        return result.href;
    }
    async function latency(base) {
        const values = [];
        for (let i = 0; i < 6; i++) {
            if (stopped) throw new Error("测速已停止");
            phaseController = new AbortController();
            const timeout = setTimeout(() => phaseController.abort(), 6000);
            const start = performance.now();
            try {
                const response = await fetch(url(base, "empty.php"), { signal: phaseController.signal, cache: "no-store", credentials: "omit" });
                if (!response.ok) throw new Error(`节点响应 ${response.status}`);
                await response.arrayBuffer();
                values.push(performance.now() - start);
            } finally { clearTimeout(timeout); }
        }
        const sorted = [...values].sort((a, b) => a - b);
        const jitter = values.slice(1).reduce((sum, v, i) => sum + Math.abs(v - values[i]), 0) / (values.length - 1);
        setText("speedLatency", `${((sorted[2] + sorted[3]) / 2).toFixed(0)} / ${jitter.toFixed(0)}`);
    }
    async function phase(base, upload) {
        const controller = new AbortController();
        phaseController = controller;
        const limit = upload ? 16 * mib : 64 * mib;
        const chunk = upload ? mib : 4 * mib;
        let reserved = 0, bytes = 0, liveBytes = 0, lastBytes = 0, errors = 0;
        const start = performance.now();
        let previous = start;
        samples = [];
        document.getElementById("speedCurve").setAttribute("d", "");
        const deadline = setTimeout(() => controller.abort(), 8000);
        const tick = setInterval(() => {
            const now = performance.now();
            chart((liveBytes - lastBytes) * 8 / (now - previous) / 1000);
            previous = now;
            lastBytes = liveBytes;
        }, 300);
        const payload = new Uint8Array(upload ? chunk : 0);
        for (let offset = 0; offset < payload.length; offset += 65536) crypto.getRandomValues(payload.subarray(offset, offset + 65536));
        async function worker() {
            while (!controller.signal.aborted && reserved < limit) {
                reserved += chunk;
                try {
                    if (upload) {
                        await new Promise((resolve, reject) => {
                            const xhr = new XMLHttpRequest();
                            let sent = 0;
                            const abort = () => xhr.abort();
                            function cleanup() { controller.signal.removeEventListener("abort", abort); }
                            xhr.open("POST", url(base, "empty.php"));
                            xhr.timeout = 8000;
                            xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
                            xhr.upload.onprogress = event => {
                                const delta = Math.max(0, Math.min(chunk, event.loaded) - sent);
                                sent += delta; liveBytes += delta; traffic(delta);
                            };
                            xhr.onload = () => {
                                cleanup();
                                if (xhr.status >= 200 && xhr.status < 300) { bytes += chunk; resolve(); }
                                else reject(new Error(`上传响应 ${xhr.status}`));
                            };
                            xhr.onerror = xhr.ontimeout = xhr.onabort = () => { cleanup(); reject(new Error("上传未完成")); };
                            controller.signal.addEventListener("abort", abort, { once: true });
                            if (controller.signal.aborted) { cleanup(); reject(new Error("已停止")); return; }
                            xhr.send(payload);
                        });
                    } else {
                        const response = await fetch(url(base, "garbage.php", { ckSize: "4" }), { cache: "no-store", credentials: "omit", signal: controller.signal });
                        if (!response.ok || !response.body) throw new Error(`下载响应 ${response.status}`);
                        const reader = response.body.getReader();
                        let read = 0;
                        try {
                            while (!controller.signal.aborted && read < chunk) {
                                const part = await reader.read();
                                if (part.done) break;
                                const count = Math.min(part.value.byteLength, chunk - read);
                                read += count; bytes += count; liveBytes += count; traffic(count);
                            }
                        } finally { await reader.cancel().catch(() => {}); }
                    }
                } catch { if (!controller.signal.aborted) errors++; }
            }
        }
        try { await Promise.all([worker(), worker(), worker()]); }
        finally { clearTimeout(deadline); clearInterval(tick); }
        const seconds = (performance.now() - start) / 1000;
        if (stopped) throw new Error("测速已停止");
        if (!bytes) throw new Error(`${upload ? "上传" : "下载"}未成功，请更换节点或重试`);
        setText(upload ? "speedUp" : "speedDown", (bytes * 8 / seconds / 1000000).toFixed(1));
        return { short: seconds < 2, errors };
    }
    button.addEventListener("click", async () => {
        if (running) { stopped = true; phaseController?.abort(); return; }
        running = true; stopped = false; transferred = 0;
        button.textContent = "停止测速"; select.disabled = true;
        ["speedDown", "speedUp", "speedLatency"].forEach(id => setText(id, "--"));
        setText("speedTraffic", "0");
        window.dispatchEvent(new CustomEvent("dashboard-speed-state", { detail: { running: true } }));
        try {
            const base = nodes[select.value];
            setText("speedStatus", "正在测量节点 HTTP 延迟…");
            await latency(base);
            setText("speedStatus", "正在下载测试数据（最多 8 秒 / 64 MiB）…");
            const down = await phase(base, false);
            setText("speedStatus", "正在上传测试数据（最多 8 秒 / 16 MiB）…");
            const up = await phase(base, true);
            setText("speedStatus", `测速完成 · ${select.selectedOptions[0].textContent}${down.short || up.short ? " · 达到流量上限，样本不足 2 秒，结果仅供参考" : ""}${down.errors || up.errors ? " · 部分请求失败，结果可能偏低" : ""}`);
        } catch (error) { setText("speedStatus", stopped ? "测速已停止，保留已完成阶段的结果。" : `测速失败：${error.message}。可切换国际节点重试。`); }
        finally {
            running = false; button.textContent = "开始测速"; select.disabled = false;
            window.dispatchEvent(new CustomEvent("dashboard-speed-state", { detail: { running: false } }));
        }
    });
    window.addEventListener("pagehide", () => { stopped = true; phaseController?.abort(); });
}

function setupRouteTool() {
    const button = document.getElementById("routeStart");
    if (!button) return;
    const target = document.getElementById("routeTarget");
    const family = document.getElementById("routeFamily");
    const presets = [["抖音", "www.douyin.com"], ["哔哩哔哩", "www.bilibili.com"], ["微信", "weixin.qq.com"], ["淘宝", "www.taobao.com"], ["GitHub", "github.com"], ["jsDelivr", "cdn.jsdelivr.net"], ["Cloudflare", "www.cloudflare.com"], ["YouTube", "www.youtube.com"]];
    let token = "", jobId = "", running = false, pollTimer, alive = true, map, layers;
    const presetButtons = [];
    presets.forEach(([label, host]) => {
        const node = document.createElement("button"); node.type = "button"; node.className = "btn"; node.textContent = label;
        node.addEventListener("click", () => { target.value = host; });
        document.getElementById("routePresets").appendChild(node); presetButtons.push(node);
    });
    function ensureMap() {
        if (map || !window.L) return;
        map = L.map("routeMap", { scrollWheelZoom: false }).setView([25, 100], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
        layers = L.layerGroup().addTo(map);
    }
    async function api(path, data) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
            const response = await fetch(`/api/network/${path}`, { method: data ? "POST" : "GET", cache: "no-store", signal: controller.signal,
                headers: { "X-Network-Token": token, ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `助手响应 ${response.status}`);
            return result;
        } finally { clearTimeout(timeout); }
    }
    async function connect() {
        button.disabled = true;
        try {
            const info = await api("health");
            if (info.name !== "personal-network-helper") throw new Error("不是路由助手");
            token = info.token; button.disabled = false;
            document.getElementById("routeExit").hidden = false;
            const pageSource = info.pageSource === "project" ? "最新项目页面（刷新即可同步修改）" : "程序内置页面快照（更新页面需下载新版助手）";
            setText("routeStatus", `本地助手已连接 · ${pageSource} · 可追踪 8 个预设网站或自定义地址`);
            document.getElementById("routeHelp").open = false;
        } catch {
            token = "";
            setText("routeStatus", "首次使用：下载并运行免安装助手，即可在自动打开的面板里追踪本机路由。");
            document.getElementById("routeHelp").open = true;
        }
    }
    let fitted = false;
    function render(job) {
        const body = document.getElementById("routeHops"); body.replaceChildren();
        ensureMap(); layers?.clearLayers();
        const points = [];
        job.hops.forEach(hop => {
            const row = document.createElement("tr");
            const geo = hop.geo;
            const location = hop.ip ? (geo ? [geo.location, geo.org, geo.source].filter(Boolean).join(" · ") : "正在查询归属地…") : "未收到跳点 IP";
            [hop.hop, hop.ip || "*", hop.rtt.join(" / "), location].forEach(value => { const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell); });
            body.appendChild(row);
            if (map && Number.isFinite(geo?.lat) && Number.isFinite(geo?.lon) && Math.abs(geo.lat) <= 90 && Math.abs(geo.lon) <= 180) {
                const point = [geo.lat, geo.lon]; points.push(point);
                const popup = document.createElement("div"); popup.textContent = `第 ${hop.hop} 跳 · ${hop.ip} · ${location}`;
                const marker = L.marker(point, { icon: L.divIcon({ className: "hop-marker", html: String(hop.hop), iconSize: [28, 28] }) }).bindPopup(popup).addTo(layers);
                const link = document.createElement("button"); link.type = "button"; link.className = "route-map-link"; link.textContent = "地图 ↗";
                link.addEventListener("click", () => { map.setView(point, 6); marker.openPopup(); }); row.lastChild.appendChild(link);
            }
        });
        if (!job.hops.length) { const row = body.insertRow(); const cell = row.insertCell(); cell.colSpan = 4; cell.textContent = "正在解析目标并等待跳点…"; }
        if (map && points.length) {
            L.polyline(points, { color: "#0284c7", dashArray: "6 8", weight: 3 }).addTo(layers);
            if (!fitted || !["running", "locating"].includes(job.status)) { map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 6 }); fitted = true; }
        }
        const states = { running: "追踪中", locating: "正在补全 IP 归属地", completed: "追踪完成", partial: "部分结果", cancelled: "已停止", error: "追踪失败" };
        setText("routeStatus", `${states[job.status] || job.status} · ${job.target}${job.destination ? ` → ${job.destination}` : ""} · ${job.hops.length} 跳${job.message ? ` · ${job.message}` : ""}`);
    }
    function busy(value) {
        running = value; button.textContent = value ? "停止追踪" : "开始追踪";
        target.disabled = family.disabled = value; presetButtons.forEach(node => node.disabled = value);
    }
    async function poll() {
        if (!alive) return;
        try {
            const job = await api(`traces/${jobId}`); render(job);
            if (["running", "locating"].includes(job.status)) pollTimer = setTimeout(poll, 900);
            else busy(false);
        } catch (error) { busy(false); setText("routeStatus", `读取结果失败：${error.message}。任务可能仍在本机执行，请重连助手。`); }
    }
    button.addEventListener("click", async () => {
        if (running) {
            try { await api(`traces/${jobId}/cancel`, {}); }
            catch (error) { setText("routeStatus", `停止失败：${error.message}`); }
            return;
        }
        try {
            busy(true); fitted = false;
            const job = await api("traces", { target: target.value, family: family.value, maxHops: 30 });
            jobId = job.id; await poll();
        } catch (error) { busy(false); setText("routeStatus", `无法开始追踪：${error.message}`); }
    });
    document.getElementById("routeConnect").addEventListener("click", connect);
    document.getElementById("routeExit").addEventListener("click", async () => {
        try {
            await api("shutdown", {});
            alive = false; clearTimeout(pollTimer); busy(false); button.disabled = true;
            document.getElementById("routeExit").hidden = true;
            setText("routeStatus", "本地助手已退出。需要追踪时重新运行下载的程序即可。");
        } catch (error) { setText("routeStatus", `退出失败：${error.message}`); }
    });
    window.addEventListener("pagehide", () => { alive = false; clearTimeout(pollTimer); if (running && token) fetch(`/api/network/traces/${jobId}/cancel`, { method: "POST", headers: { "X-Network-Token": token, "Content-Type": "application/json" }, body: "{}", keepalive: true }).catch(() => {}); });
    // Avoid fetching map tiles until the user starts a trace.
    connect();
}
