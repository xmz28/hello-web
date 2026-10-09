// All probes run in the visitor's browser so VPN routing is reflected in the results.
function setupNetworkChecks() {
    const networkButton = document.getElementById("networkRefresh");
    const ipButton = document.getElementById("ipRefresh");
    const sitesContainer = document.getElementById("networkSites");
    const sourcesContainer = document.getElementById("ipSources");
    if (!networkButton || !ipButton || !sitesContainer || !sourcesContainer) return;

    const sites = [
        { name: "抖音 / ByteDance", group: "国内", url: "https://www.douyin.com/favicon.ico" },
        { name: "Bilibili", group: "国内", url: "https://www.bilibili.com/favicon.ico" },
        { name: "微信", group: "国内", url: "https://weixin.qq.com/favicon.ico" },
        { name: "淘宝", group: "国内", url: "https://www.taobao.com/favicon.ico" },
        { name: "GitHub", group: "国际", url: "https://github.com/favicon.ico" },
        { name: "jsDelivr", group: "国际", url: "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js" },
        { name: "Cloudflare", group: "国际", url: "https://www.cloudflare.com/favicon.ico" },
        { name: "YouTube", group: "国际", url: "https://www.youtube.com/favicon.ico" }
    ];
    const ipSources = [
        {
            name: "IPIP", group: "国内来源", url: "https://myip.ipip.net/json",
            parse(data) {
                const location = Array.isArray(data.data?.location) ? data.data.location : [];
                return { ip: data.data?.ip, location: location.slice(0, 4).filter(Boolean).join(" · "), network: location[4] || "", cityLocation: location };
            }
        },
        {
            name: "IPinfo", group: "国际来源", url: "https://ipinfo.io/json",
            parse(data) {
                return { ip: data.ip, country: data.country, location: [countryName(data.country), data.region, data.city].filter(Boolean).join(" · "), network: data.org || "" };
            }
        },
        {
            name: "ipwho.is", group: "国际来源", url: "https://ipwho.is/",
            parse(data) {
                if (!data.success) throw new Error("Lookup unavailable");
                return { ip: data.ip, country: data.country_code, location: [data.country, data.region, data.city].filter(Boolean).join(" · "), network: [data.connection?.isp, data.connection?.asn ? `AS${data.connection.asn}` : ""].filter(Boolean).join(" · ") };
            }
        },
        {
            name: "Cloudflare", group: "国际来源", url: "https://cp.cloudflare.com/cdn-cgi/trace", text: true,
            parse(text) {
                const data = Object.fromEntries(text.trim().split("\n").map(line => {
                    const separator = line.indexOf("=");
                    return [line.slice(0, separator), line.slice(separator + 1).trim()];
                }));
                return { ip: data.ip, country: data.loc, location: countryName(data.loc), network: data.colo ? `接入机房 ${data.colo}（不是出口城市）` : "" };
            }
        }
    ];

    function node(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function heading(name, group) {
        const header = node("div", "probe-heading");
        header.append(node("h3", "", name), node("div", `probe-badge ${group.startsWith("国内") ? "domestic" : "international"}`, group));
        return header;
    }

    function countryName(code) {
        if (!code) return "";
        try { return new Intl.DisplayNames(["zh-CN"], { type: "region" }).of(code) || code; }
        catch { return code; }
    }

    function validIp(ip) {
        if (typeof ip !== "string") return false;
        if (ip.includes(":")) return ip.length <= 45 && /^[0-9a-f:]+$/i.test(ip);
        const parts = ip.split(".");
        return parts.length === 4 && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255);
    }

    sites.forEach(site => {
        const item = node("article", "network-site");
        const result = node("div", "probe-result");
        site.value = node("b", "probe-value", "待检测");
        site.dots = node("div", "probe-history");
        site.history = [];
        result.append(site.value, site.dots);
        item.append(heading(site.name, site.group), result);
        sitesContainer.append(item);
        renderHistory(site);
    });

    function renderHistory(site) {
        site.dots.replaceChildren();
        for (let i = site.history.length; i < 12; i++) {
            const dot = node("i", "probe-dot empty");
            dot.title = "尚无记录";
            dot.setAttribute("aria-hidden", "true");
            site.dots.append(dot);
        }
        site.history.forEach(sample => {
            const dot = node("i", `probe-dot ${sample.level}`);
            dot.title = `${sample.time} · ${sample.label}`;
            dot.setAttribute("aria-hidden", "true");
            site.dots.append(dot);
        });
        site.dots.setAttribute("aria-label", `最近 ${site.history.length} 次请求：${site.history.map(sample => sample.label).join("、") || "无记录"}`);
    }

    function record(site, label, level) {
        site.value.textContent = label;
        site.value.dataset.level = level;
        site.history.push({ label, level, time: new Date().toLocaleTimeString("zh-CN", { hour12: false }) });
        site.history = site.history.slice(-12);
        renderHistory(site);
    }

    let networkActive = false;
    let networkRunning = false;
    let roundController;

    async function probe(site, roundSignal) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        roundSignal.addEventListener("abort", abort, { once: true });
        let timedOut = false;
        const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 6000);
        const started = performance.now();
        try {
            const url = new URL(site.url);
            url.searchParams.set("network-check", `${Date.now()}-${Math.random().toString(36).slice(2)}`);
            // HEAD avoids downloading resources. Opaque responses prove only that
            // an HTTP response arrived; their HTTP status cannot be inspected.
            await fetch(url.href, { method: "HEAD", mode: "no-cors", cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal });
            if (roundSignal.aborted) return null;
            const elapsed = Math.max(1, Math.round(performance.now() - started));
            record(site, `${elapsed} ms`, elapsed <= 150 ? "good" : elapsed <= 300 ? "medium" : "slow");
            return true;
        } catch {
            if (roundSignal.aborted) return null;
            record(site, timedOut ? "超时" : "请求失败", "failed");
            return false;
        } finally {
            clearTimeout(timeout);
            roundSignal.removeEventListener("abort", abort);
        }
    }

    function updateProgress() {
        const completed = sites.filter(site => site.history.length === 12).length;
        const attempts = sites.reduce((total, site) => total + site.history.length, 0);
        setText("networkStatus", `已完成 ${completed} / 8 个站点 · ${attempts} / 96 次请求`);
    }

    async function runBatch() {
        if (!networkActive || networkRunning || document.hidden) return;
        networkRunning = true;
        const controller = new AbortController();
        roundController = controller;
        try {
            if (!navigator.onLine) {
                setText("networkStatus", "浏览器报告离线，等待网络恢复后继续");
            } else {
                updateProgress();
                await Promise.all(sites.map(async site => {
                    while (site.history.length < 12 && !controller.signal.aborted) {
                        await probe(site, controller.signal);
                        if (!controller.signal.aborted) updateProgress();
                    }
                }));
                if (!controller.signal.aborted) {
                    networkActive = false;
                    networkButton.textContent = "重新检测";
                    networkButton.setAttribute("aria-pressed", "false");
                    setText("networkStatus", "检测完成 · 8 个站点各完成 12 次请求，已自动停止");
                }
            }
        } finally {
            networkRunning = false;
            roundController = undefined;
            // Resume if the user returned or clicked Continue during cancellation.
            if (controller.signal.aborted && networkActive && !document.hidden && navigator.onLine) runBatch();
        }
    }

    function toggleNetwork() {
        networkActive = !networkActive;
        if (networkActive && sites.every(site => site.history.length === 12)) {
            sites.forEach(site => { site.history = []; site.value.textContent = "待检测"; delete site.value.dataset.level; renderHistory(site); });
        }
        networkButton.textContent = networkActive ? "暂停检测" : "继续检测";
        networkButton.setAttribute("aria-pressed", String(networkActive));
        if (networkActive) runBatch();
        else {
            roundController?.abort();
            setText("networkStatus", "检测已暂停，保留最近的真实请求记录");
        }
    }

    ipSources.forEach(source => {
        const item = node("article", "ip-source");
        source.value = node("div", "ip-source-value", "待检测");
        source.location = node("p", "ip-source-location", "数据库归属地：--");
        source.network = node("p", "ip-source-network");
        item.append(heading(source.name, source.group), source.value, source.location, source.network);
        sourcesContainer.append(item);
    });

    async function checkIpSource(source) {
        source.value.textContent = "查询中...";
        source.location.textContent = "数据库归属地：--";
        source.network.textContent = "";
        source.result = undefined;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch(source.url, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal });
            if (!response.ok) throw new Error("Service unavailable");
            const result = source.parse(source.text ? await response.text() : await response.json());
            if (!validIp(result.ip)) throw new Error("Invalid IP response");
            source.result = result;
            source.value.textContent = result.ip;
            source.location.textContent = `数据库归属地：${result.location || "未知"}`;
            source.network.textContent = result.network;
            if (source.name === "IPIP") loadIpipWeather(result.cityLocation);
            return result;
        } catch {
            source.value.textContent = "查询失败";
            source.location.textContent = "服务超时、受限或不可访问，可稍后重试";
            if (source.name === "IPIP") resetIpipWeather("IPIP 查询失败，无法获取城市天气");
        } finally { clearTimeout(timeout); }
    }

    async function checkIp() {
        ipButton.disabled = true;
        resetIpipWeather("正在查询 IPIP 城市...");
        setText("ipSummary", "正在分别查询 4 家服务的出口信息...");
        try {
            await Promise.all(ipSources.map(checkIpSource));
            const results = ipSources.map(source => source.result).filter(Boolean);
            const ips = new Set(results.map(result => result.ip));
            if (!results.length) {
                setText("ipSummary", "所有来源均未返回有效结果，请稍后重试或打开下方检测站点");
                return;
            }
            const conflict = [...ips].some(ip => new Set(results.filter(result => result.ip === ip && result.country).map(result => result.country)).size > 1);
            const summary = [`${results.length} / 4 个来源完成`];
            summary.push(ips.size > 1 ? `发现 ${ips.size} 个出口 IP，可能存在 VPN 分流或出口变化` : "这些服务看到相同出口 IP");
            if (conflict) summary.push("同一 IP 的国家归属地存在数据库分歧");
            setText("ipSummary", summary.join(" · "));
            return ipSources[0].result;
        } finally { ipButton.disabled = false; }
    }

    let resumeAfterSpeed = false;
    window.addEventListener("dashboard-speed-state", event => {
        if (event.detail.running) {
            resumeAfterSpeed = networkActive;
            networkActive = false;
            roundController?.abort();
            networkButton.disabled = true;
            networkButton.setAttribute("aria-pressed", "false");
            setText("networkStatus", "测速期间暂停网站延迟检测");
        } else {
            networkButton.disabled = false;
            if (resumeAfterSpeed) { networkActive = true; networkButton.textContent = "暂停检测"; networkButton.setAttribute("aria-pressed", "true"); runBatch(); }
            else updateProgress();
            resumeAfterSpeed = false;
        }
    });
    networkButton.addEventListener("click", toggleNetwork);
    ipButton.addEventListener("click", checkIp);
    document.addEventListener("visibilitychange", () => {
        if (!networkActive) return;
        if (document.hidden) {
            roundController?.abort();
            setText("networkStatus", "页面在后台，连续检测已暂停");
        } else runBatch();
    });
    window.addEventListener("offline", () => {
        roundController?.abort();
        setText("networkStatus", "浏览器报告离线");
    });
    window.addEventListener("online", runBatch);
    window.addEventListener("pagehide", () => {
        networkActive = false;
        roundController?.abort();
        networkButton.textContent = "继续检测";
        networkButton.setAttribute("aria-pressed", "false");
        setText("networkStatus", "检测已暂停，保留最近的真实请求记录");
    });
    const initialIpip = checkIp();
    setupProtocolChecks(initialIpip);
    toggleNetwork();
}

function setupProtocolChecks(initialIpip) {
    const endpoints = {
        4: ["https://myip.ipip.net/json", "https://api.ipify.org?format=json", "https://ipv4.icanhazip.com/"],
        6: ["https://api6.ipify.org?format=json", "https://ipv6.icanhazip.com/"]
    };
    function validFamily(ip, version) {
        return version === 6 ? typeof ip === "string" && ip.includes(":") && ip.length <= 45 && /^[0-9a-f:]+$/i.test(ip) : typeof ip === "string" && ip.split(".").length === 4 && ip.split(".").every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255);
    }
    async function check(version, firstLookup) {
        const button = document.getElementById(`ipv${version}Refresh`);
        button.disabled = true;
        setText(`ipv${version}Address`, "检测中...");
        setText(`ipv${version}Meta`, `正在尝试 IPv${version} 专用查询服务`);
        try {
            if (version === 4 && firstLookup) {
                const result = await firstLookup;
                if (validFamily(result?.ip, 4)) {
                    setText("ipv4Address", result.ip);
                    setText("ipv4Meta", `IPIP 看到的 IPv4 出口 · ${result.location} · ${result.network}`);
                    return;
                }
            }
            for (const url of endpoints[version]) {
                if (firstLookup && url.includes("ipip")) continue;
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 7000);
                try {
                    const response = await fetch(url, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal });
                    if (!response.ok) throw new Error("Service unavailable");
                    let ip;
                    let details = `IPv${version} 访问成功 · 来源：${new URL(url).hostname}`;
                    if (url.includes("ipip")) {
                        const data = (await response.json()).data;
                        ip = data?.ip;
                        details = `IPIP 看到的 IPv4 出口 · ${(data?.location || []).filter(Boolean).join(" · ")}`;
                    } else ip = url.includes("ipify") ? (await response.json()).ip : (await response.text()).trim();
                    if (!validFamily(ip, version)) throw new Error("Wrong IP family");
                    setText(`ipv${version}Address`, ip);
                    setText(`ipv${version}Meta`, details);
                    return;
                } catch { /* Try the second service before reporting failure. */ }
                finally { clearTimeout(timeout); }
            }
            setText(`ipv${version}Address`, "未检出");
            setText(`ipv${version}Meta`, version === 6 ? "IPv6 查询未成功：可能未启用、VPN 未转发，或查询服务不可达。" : "IPv4 查询服务未成功响应，请检查网络或重试。");
        } finally { button.disabled = false; }
    }
    [4, 6].forEach(version => {
        const button = document.getElementById(`ipv${version}Refresh`);
        if (!button) return;
        button.addEventListener("click", () => check(version));
        check(version, version === 4 ? initialIpip : undefined);
    });
}
