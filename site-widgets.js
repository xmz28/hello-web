const bootLines = [
    "[ OK ] Mounted /xmz/hello-web",
    "[ OK ] Started static blog renderer",
    "[ OK ] Loaded browser network probes",
    "[ OK ] City weather waiting for IPIP lookup",
    "[ OK ] Activated glassmorphism UI layer",
    "[ OK ] Music module waiting for user gesture",
    "[ READY ] hello-web dashboard online"
];

function seededNumber(seed, min, max) {
    let n = 0;
    for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) % 9973;
    return min + (n % (max - min + 1));
}

function setupDashboardWidgets() {
    renderBootLog();
    setupOnlineMusic();
    setupNetworkChecks();
    setupNetworkTools();
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
    const tracks = [
        { title: "The Good Times", artist: "HoliznaCC0", page: "https://freemusicarchive.org/music/holiznacc0/be-happy-with-who-you-are/the-good-times/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/4e5GjL0fiBnn8ZtCegJ7U337KfG91HXRzDjE3mkg.mp3", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
        { title: "Blue Sky", artist: "1000 Handz", page: "https://freemusicarchive.org/music/1000-handz/cc-by-free-to-use-chillstudylounge-instrumentals/blue-sky-2/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/alphIsxvJbbdYlcC1mfCrO8dbf4m5zlcxiqn3Atb.mp3", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
        { title: "Life On Cassette", artist: "HoliznaCC0", page: "https://freemusicarchive.org/music/holiznacc0/be-happy-with-who-you-are/life-on-cassette/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/MYjVCcbfTE7rjSOgLOcL9knoc6lkk6IN4PlUacfc.mp3", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
        { title: "Tulip", artist: "1000 Handz", page: "https://freemusicarchive.org/music/1000-handz/cc-by-free-to-use-chillstudylounge-instrumentals/tulip/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/MnVpaTq1obQsafjtRufgDKm5b3Kpcbt2QE1HiLRj.mp3", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
        { title: "Finding Yourself", artist: "HoliznaCC0", page: "https://freemusicarchive.org/music/holiznacc0/be-happy-with-who-you-are/finding-yourself/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/oiidxxRMyz6B7XOLx2IOfeHKb1Pq3414iDMKQtvk.mp3", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
        { title: "Lemongrass", artist: "1000 Handz", page: "https://freemusicarchive.org/music/1000-handz/cc-by-free-to-use-chillstudylounge-instrumentals/lemongrass/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/yRtAooEEVEh9ho3HW2D8ZtHJ4N3xg4E91xLYrKOX.mp3", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
        { title: "City Lights", artist: "HoliznaCC0", page: "https://freemusicarchive.org/music/holiznacc0/be-happy-with-who-you-are/city-lights-1/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/3rTPHXICTqxoPmS0YLVUSm9qwOWoJxiXTaOy2vmx.mp3", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
        { title: "Community", artist: "1000 Handz", page: "https://freemusicarchive.org/music/1000-handz/cc-by-free-to-use-chillstudylounge-instrumentals/community/", file: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/XBax459PuYU79ofiKfFQgkLE2ZAj6Pam57F2scvz.mp3", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" }
    ];
    const audio = document.getElementById("onlineMusic");
    const button = document.getElementById("musicToggle");
    const previous = document.getElementById("musicPrevious");
    const next = document.getElementById("musicNext");
    const select = document.getElementById("musicSelect");
    const title = document.getElementById("musicTrack");
    const status = document.getElementById("musicStatus");
    const artist = document.getElementById("musicArtist");
    const source = document.getElementById("musicSource");
    const license = document.getElementById("musicLicense");
    if (!audio || !button || !previous || !next || !select || !title || !status || !artist || !source || !license) return;

    let currentIndex = 0;
    let playRequest = 0;
    audio.volume = 0.35;
    tracks.forEach((track, index) => {
        const option = new Option(`${index + 1}. ${track.title} — ${track.artist}`, String(index));
        select.add(option);
    });

    const play = async () => {
        const request = ++playRequest;
        status.textContent = "正在加载音乐...";
        try {
            await audio.play();
        } catch (error) {
            if (request !== playRequest) return;
            button.textContent = "播放";
            status.textContent = error.name === "NotAllowedError"
                ? "浏览器已拦截自动播放，点击播放"
                : "音频加载失败，请换一首或稍后重试";
        }
    };

    const chooseTrack = (index, startPlaying) => {
        playRequest++;
        currentIndex = (index + tracks.length) % tracks.length;
        const track = tracks[currentIndex];
        audio.src = track.file;
        audio.load();
        select.value = String(currentIndex);
        title.textContent = track.title;
        artist.textContent = track.artist;
        source.href = track.page;
        license.href = track.licenseUrl;
        license.textContent = track.license;
        button.textContent = "播放";
        status.textContent = startPlaying ? "正在加载音乐..." : "点击播放";
        if (startPlaying) play();
    };

    audio.addEventListener("playing", () => {
        button.textContent = "暂停";
        status.textContent = `正在播放：${tracks[currentIndex].artist} · ${tracks[currentIndex].title}`;
    });
    audio.addEventListener("pause", () => {
        button.textContent = "播放";
        if (!audio.ended) status.textContent = "已暂停";
    });
    audio.addEventListener("ended", () => chooseTrack(currentIndex + 1, true));
    audio.addEventListener("error", () => {
        button.textContent = "播放";
        status.textContent = "音频加载失败，请换一首或稍后重试";
    });
    const cancelAutoplay = () => clearTimeout(autoplayTimer);
    button.addEventListener("click", () => {
        cancelAutoplay();
        if (audio.paused) play();
        else audio.pause();
    });
    previous.addEventListener("click", () => {
        cancelAutoplay();
        chooseTrack(currentIndex - 1, !audio.paused);
    });
    next.addEventListener("click", () => {
        cancelAutoplay();
        chooseTrack(currentIndex + 1, !audio.paused);
    });
    select.addEventListener("change", () => {
        cancelAutoplay();
        chooseTrack(Number(select.value), !audio.paused);
    });

    chooseTrack(0, false);
    const autoplayTimer = setTimeout(play, 500);
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
        printLine(output, `$ ${command}`, true);
        input.value = "";
        runCommand(output, command, mode);
    });
    input.focus();
}

function printLine(output, text, original = false) {
    const row = document.createElement("div");
    if (original) row.setAttribute("data-original-content", "");
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
