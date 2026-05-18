const bootLines = [
    "[ OK ] Mounted /xmz/hello-web",
    "[ OK ] Started static blog renderer",
    "[ OK ] Loaded visitor telemetry simulator",
    "[ OK ] Synced Tokyo weather channel",
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
    const todayKey = new Date().toISOString().slice(0, 10);
    const totalKey = "xmzTotalVisits";
    const total = Number(localStorage.getItem(totalKey) || 4820) + 1;
    localStorage.setItem(totalKey, total);

    setText("totalVisits", total.toLocaleString("zh-CN"));
    updateOnlineCount();
    setInterval(updateOnlineCount, 4000);

    renderBootLog();
    loadUpdates();
    loadTokyoWeather();
    setupOnlineMusic();
}

function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
}

function updateOnlineCount() {
    const base = 8 + Math.floor((Date.now() / 10000) % 7);
    setText("onlineUsers", base + Math.floor(Math.random() * 5));
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

async function loadTokyoWeather() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FTokyo";
        const response = await fetch(url);
        const data = await response.json();
        const c = data.current;
        setText("tokyoTemp", `${Math.round(c.temperature_2m)}°C`);
        setText("tokyoMeta", `湿度 ${c.relative_humidity_2m}% · 风速 ${Math.round(c.wind_speed_10m)} km/h`);
        setText("tokyoWeather", weatherLabel(c.weather_code));
    } catch {
        setText("tokyoTemp", "获取失败");
        setText("tokyoMeta", "请检查网络或稍后重试");
        setText("tokyoWeather", "获取失败");
    }
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
