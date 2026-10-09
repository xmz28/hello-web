const bootLines = [
    "[ OK ] Mounted /xmz/hello-web",
    "[ OK ] Started static blog renderer",
    "[ OK ] Loaded browser network probes",
    "[ OK ] City weather waiting for IPIP lookup",
    "[ OK ] Activated glassmorphism UI layer",
    "[ OK ] Music module waiting for user gesture",
    "[ READY ] hello-web dashboard online"
];

const fallbackUpdates = [
    {
        date: "v1.2",
        title: "更新",
        items: ["新增小游戏", "新增博客系统", "优化移动端"]
    }
];

function seededNumber(seed, min, max) {
    let n = 0;
    for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) % 9973;
    return min + (n % (max - min + 1));
}

function setupDashboardWidgets() {
    renderBootLog();
    loadUpdates();
    setupOnlineMusic();
    setupNetworkChecks();
}

function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
}

function renderBootLog() {
    const log = document.getElementById("bootLog");
    if (!log) return;
    log.innerHTML = "";
    bootLines.forEach((line, index) => {
        setTimeout(() => {
            const row = document.createElement("div");
            row.textContent = line;
            log.appendChild(row);
            log.scrollTop = log.scrollHeight;
        }, index * 260);
    });
}

async function loadUpdates() {
    const list = document.getElementById("updateList");
    if (!list) return;
    try {
        const response = await fetch("updates.json", { cache: "no-store" });
        const updates = await response.json();
        renderUpdates(list, updates);
    } catch {
        renderUpdates(list, fallbackUpdates);
    }
}

function renderUpdates(list, updates) {
    list.innerHTML = updates.map((update) => `
        <article>
            <time>${update.date}</time>
            <h3>${update.title}</h3>
            <p>${update.items.join(" / ")}</p>
        </article>
    `).join("");
}

let cityWeatherController;

function resetIpipWeather(message) {
    cityWeatherController?.abort();
    cityWeatherController = undefined;
    setText("cityWeatherTitle", "IPIP 城市天气");
    setText("cityTemp", "--");
    setText("cityWeather", message);
    setText("cityWeatherMeta", "");
}

async function loadIpipWeather(location) {
    cityWeatherController?.abort();
    const city = location?.[2];
    if (!city) {
        resetIpipWeather("IPIP 未返回城市，无法获取天气");
        return;
    }
    const controller = new AbortController();
    cityWeatherController = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    setText("cityWeatherTitle", `${city}实时天气`);
    setText("cityTemp", "--");
    setText("cityWeather", "加载城市天气...");
    setText("cityWeatherMeta", "城市来源：IPIP");
    try {
        const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        const china = location[0] === "中国" || location[0] === "China";
        geoUrl.search = new URLSearchParams({ name: china ? city : `${city}, ${location[0]}`, count: "10", language: "zh", ...(china ? { countryCode: "CN" } : {}) });
        const geoResponse = await fetch(geoUrl, { signal: controller.signal, credentials: "omit" });
        if (!geoResponse.ok) throw new Error("Geocoding unavailable");
        const geo = await geoResponse.json();
        const normalize = name => String(name || "").replace(/(?:省|市)$/u, "").toLowerCase();
        const place = (geo.results || []).find(result => normalize(result.name) === normalize(city) && (!china || !location[1] || normalize(result.admin1) === normalize(location[1])));
        if (!place) throw new Error("City not found");
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.search = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m", timezone: "auto" });
        const response = await fetch(url, { signal: controller.signal, credentials: "omit" });
        if (!response.ok) throw new Error("Weather unavailable");
        const data = await response.json();
        const c = data.current;
        if (cityWeatherController !== controller) return;
        if (!Number.isFinite(c?.temperature_2m)) throw new Error("Invalid weather response");
        setText("cityTemp", `${Math.round(c.temperature_2m)}°C`);
        setText("cityWeatherMeta", `湿度 ${c.relative_humidity_2m}% · 风速 ${Math.round(c.wind_speed_10m)} km/h · 城市：IPIP / 天气：Open-Meteo`);
        setText("cityWeather", weatherLabel(c.weather_code));
    } catch {
        if (cityWeatherController !== controller) return;
        setText("cityTemp", "获取失败");
        setText("cityWeatherMeta", "可重新检测公网 IP 后重试天气查询");
        setText("cityWeather", "城市定位或天气服务未成功响应");
    } finally { clearTimeout(timeout); }
}

function weatherLabel(code) {
    if (code === 0) return "晴朗";
    if (code <= 3) return "多云";
    if (code < 60) return "雾 / 小雨";
    if (code < 80) return "降雨";
    return "阵雨";
}

function setupOnlineMusic() {
    const audio = document.getElementById("onlineMusic");
    const button = document.getElementById("musicToggle");
    const status = document.getElementById("musicStatus");
    if (!audio || !button || !status) return;

    const tryPlay = () => {
        audio.volume = 0.35;
        audio.play()
            .then(() => {
                status.textContent = "正在播放：久石让 - Summer";
                button.textContent = "暂停";
            })
            .catch(() => {
                status.textContent = "浏览器已拦截自动播放，点击播放";
                button.textContent = "播放";
            });
    };

    button.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            status.textContent = "正在播放：久石让 - Summer";
            button.textContent = "暂停";
        } else {
            audio.pause();
            status.textContent = "已暂停";
            button.textContent = "播放";
        }
    });

    setTimeout(tryPlay, 500);
}


function setupTerminalPage(mode = "terminal") {
    const output = document.getElementById("terminalOutput");
    const input = document.getElementById("terminalInput");
    if (!output || !input) return;

    const intro = mode === "ssh"
        ? ["OpenSSH_9.8p1 xmz-shell", "Connecting to hello-web.local...", "xmz@hello-web password: ******", "Welcome to XMZ Linux 2026.05 LTS"]
        : ["XMZ Web Console v1.0", "Type help to list commands."];
    intro.forEach((line) => printLine(output, line));

    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        const command = input.value.trim();
        printLine(output, `$ ${command}`);
        input.value = "";
        runCommand(output, command, mode);
    });
    input.focus();
}

function printLine(output, text) {
    const row = document.createElement("div");
    row.textContent = text;
    output.appendChild(row);
    output.scrollTop = output.scrollHeight;
}

function runCommand(output, command, mode) {
    const commands = {
        help: "help, about, status, weather tokyo, visitors, updates, neofetch, clear",
        about: "hello-web: a static personal site with simulated live widgets.",
        status: "uptime: stable | latency: 23ms | renderer: static | mode: demo",
        visitors: "today: simulated 64 | online: simulated 12 | regions: Shanghai, Tokyo, Singapore",
        "weather tokyo": "Tokyo: realtime widget available on dashboard; fallback 24°C cloudy.",
        updates: "2026-05-18 dashboard/terminal/ssh widgets added.",
        neofetch: "XMZ Linux\nOS: Hello Web Static\nShell: glass-sh\nTheme: skyline blur\nMemory: imagination/∞"
    };
    if (command === "clear") {
        output.innerHTML = "";
        return;
    }
    printLine(output, commands[command] || `${mode === "ssh" ? "bash" : "console"}: ${command}: command not found`);
}
