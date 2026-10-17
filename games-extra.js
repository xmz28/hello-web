/* Extra games share the page's pause, theme and navigation lifecycle. */
function createExtraGames({ color, onStateChange }) {
    const byId = id => document.getElementById(id);
    const recordKey = "xmz-game-records-v1";
    let records = {};
    try {
        const saved = JSON.parse(localStorage.getItem(recordKey) || "{}");
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
            for (const [key, value] of Object.entries(saved)) {
                if (/^(breaker|memory-(6|8|10))$/.test(key) && Number.isSafeInteger(value) && value >= 0) records[key] = value;
            }
        }
    } catch { /* Private browsing must not prevent play. */ }
    function saveRecord(key, value, minimize = false) {
        if (!Number.isSafeInteger(value) || value < 0) return;
        if (records[key] !== undefined && (minimize ? value >= records[key] : value <= records[key])) return;
        records[key] = value;
        try { localStorage.setItem(recordKey, JSON.stringify(records)); } catch { /* Keep a session record. */ }
    }
    function shuffle(values) {
        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }
        return values;
    }

    const faces = [
        ["sun-fill", "太阳"], ["moon-fill", "月亮"], ["star-fill", "星星"],
        ["heart-fill", "爱心"], ["rocket-fill", "火箭"], ["leaf-fill", "树叶"],
        ["music-fill", "音符"], ["cup-fill", "杯子"], ["flashlight-fill", "闪电"], ["gift-fill", "礼物"]
    ];
    const memoryBoard = byId("memoryBoard");
    let deck = [], matched = new Set(), opened = [], moves = 0, pairCount = 6, mismatchTimer = null;
    function renderMemory() {
        const focused = document.activeElement?.dataset.memory;
        memoryBoard.style.gridTemplateColumns = "repeat(4, 1fr)";
        memoryBoard.innerHTML = deck.map((face, index) => {
            const revealed = opened.includes(index) || matched.has(index);
            const state = matched.has(index) ? "已配对" : revealed ? "已翻开" : "未翻开";
            const label = `卡片 ${index + 1}，${revealed ? faces[face][1] + "，" : ""}${state}`;
            return `<button type="button" class="memory-card${revealed ? " revealed" : ""}${matched.has(index) ? " matched" : ""}" data-memory="${index}" aria-label="${label}" aria-pressed="${revealed}" ${matched.has(index) ? "disabled" : ""}><i class="ri-${revealed ? faces[face][0] : "question-mark"}" aria-hidden="true"></i></button>`;
        }).join("");
        byId("memoryMoves").textContent = moves;
        byId("memoryBest").textContent = records[`memory-${pairCount}`] ?? "—";
        byId("memoryMessage").textContent = matched.size === deck.length
            ? `全部配对成功！用了 ${moves} 步` : `已配对 ${matched.size / 2}/${pairCount}`;
        if (focused !== undefined) {
            const target = memoryBoard.querySelector(`[data-memory="${focused}"]:not([disabled])`)
                || memoryBoard.querySelector("button:not([disabled])") || byId("memoryRestart");
            target?.focus({ preventScroll: true });
        }
    }
    function startMemory(value = Number(byId("memoryDifficulty").value)) {
        clearTimeout(mismatchTimer);
        mismatchTimer = null;
        pairCount = [6, 8, 10].includes(value) ? value : 6;
        byId("memoryDifficulty").value = String(pairCount);
        deck = shuffle(Array.from({ length: pairCount * 2 }, (_, i) => i % pairCount));
        matched = new Set(); opened = []; moves = 0;
        renderMemory();
    }
    function flipMemory(index) {
        if (!Number.isInteger(index) || index < 0 || index >= deck.length || mismatchTimer !== null || matched.has(index) || opened.includes(index)) return;
        opened.push(index);
        if (opened.length === 2) {
            moves++;
            if (deck[opened[0]] === deck[opened[1]]) {
                opened.forEach(i => matched.add(i));
                opened = [];
                if (matched.size === deck.length) saveRecord(`memory-${pairCount}`, moves, true);
            } else {
                mismatchTimer = setTimeout(() => {
                    mismatchTimer = null; opened = []; renderMemory();
                }, 800);
            }
        }
        renderMemory();
    }
    memoryBoard.addEventListener("click", event => {
        const card = event.target.closest("[data-memory]");
        if (card) flipMemory(Number(card.dataset.memory));
    });
    byId("memoryDifficulty").addEventListener("change", () => startMemory());
    byId("memoryRestart").addEventListener("click", () => startMemory());

    const canvas = byId("breakerCanvas");
    const ctx = canvas.getContext("2d");
    let paddle, ball, bricks, score, lives, started, paused, over, won, serving;
    let breakerTimer = null, dragPointer = null;
    const width = 360, height = 360, paddleWidth = 76, paddleY = 326, ballRadius = 7;
    function updateBreakerScore() {
        saveRecord("breaker", score);
        byId("breakerScore").textContent = score;
        byId("breakerLives").textContent = lives;
        byId("breakerBest").textContent = records.breaker ?? 0;
    }
    function resetBall() {
        serving = true;
        ball = { x: paddle + paddleWidth / 2, y: paddleY - ballRadius - 1, vx: 2.2, vy: -3.4 };
    }
    function startBreaker() {
        clearInterval(breakerTimer); breakerTimer = null;
        dragPointer = null;
        paddle = (width - paddleWidth) / 2;
        score = 0; lives = 3; started = false; paused = false; over = false; won = false;
        bricks = Array.from({ length: 30 }, (_, index) => ({
            x: 13 + (index % 6) * 56, y: 28 + Math.floor(index / 6) * 24, width: 52, height: 16, alive: true
        }));
        resetBall(); updateBreakerScore(); drawBreaker();
    }
    function drawBreaker() {
        ctx.fillStyle = color("--game-canvas", "#081321");
        ctx.fillRect(0, 0, width, height);
        bricks.forEach((brick, index) => {
            if (!brick.alive) return;
            ctx.fillStyle = ["#cf4388", "#a960c4", "#3b86ad", "#228d91", "#ad781c"][Math.floor(index / 6)];
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = color("--game-piece-edge", "rgba(255,255,255,.5)");
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        });
        ctx.fillStyle = color("--game-snake", "#6ee7f9");
        ctx.fillRect(paddle, paddleY, paddleWidth, 10);
        ctx.fillStyle = color("--game-bird", "#ffd166");
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color("--game-piece-edge", "#d2a54d"); ctx.lineWidth = 1.5; ctx.stroke();
    }
    function finishBreaker(victory) {
        over = true; won = victory;
        byId("breakerMessage").textContent = victory ? `全部击碎！得分 ${score}` : `游戏结束，得分 ${score}`;
        byId("breakerMessage").hidden = false;
        onStateChange();
    }
    function stepBreaker() {
        if (!started || paused || over) return;
        // Small substeps prevent passing through a paddle or thin brick.
        for (let step = 0; step < 3; step++) {
            const previousX = ball.x, previousY = ball.y;
            ball.x += ball.vx / 3; ball.y += ball.vy / 3;
            if (ball.x < ballRadius || ball.x > width - ballRadius) {
                ball.x = Math.max(ballRadius, Math.min(width - ballRadius, ball.x)); ball.vx = -ball.vx;
            }
            if (ball.y < ballRadius) { ball.y = ballRadius; ball.vy = Math.abs(ball.vy); }
            if (ball.vy > 0 && previousY + ballRadius <= paddleY && ball.y + ballRadius >= paddleY
                && ball.x + ballRadius >= paddle && ball.x - ballRadius <= paddle + paddleWidth) {
                ball.y = paddleY - ballRadius;
                const offset = Math.max(-1, Math.min(1, (ball.x - paddle - paddleWidth / 2) / (paddleWidth / 2)));
                ball.vx = offset * 3.6; ball.vy = -Math.sqrt(4.4 * 4.4 - ball.vx * ball.vx);
            }
            const hit = bricks.find(brick => brick.alive && ball.x + ballRadius > brick.x && ball.x - ballRadius < brick.x + brick.width
                && ball.y + ballRadius > brick.y && ball.y - ballRadius < brick.y + brick.height);
            if (hit) {
                hit.alive = false; score += 10; updateBreakerScore();
                if (previousX + ballRadius <= hit.x || previousX - ballRadius >= hit.x + hit.width) ball.vx = -ball.vx;
                else ball.vy = -ball.vy;
                if (bricks.every(brick => !brick.alive)) { finishBreaker(true); break; }
            }
            if (ball.y - ballRadius > height) {
                lives--; updateBreakerScore();
                if (lives === 0) finishBreaker(false);
                else { resetBall(); paused = true; onStateChange(); }
                break;
            }
        }
        drawBreaker();
    }
    function controlBreaker(action) {
        if (over) return;
        if (action === "action") {
            if (!started) started = true;
            else paused = !paused;
            if (!paused) serving = false;
            onStateChange();
        } else if (action === "left" || action === "right") {
            if (paused && !serving) return;
            paddle = Math.max(0, Math.min(width - paddleWidth, paddle + (action === "left" ? -24 : 24)));
            if (serving) ball.x = paddle + paddleWidth / 2;
        }
        drawBreaker();
    }
    function movePointer(event) {
        if (over || (paused && !serving)) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        paddle = Math.max(0, Math.min(width - paddleWidth, (event.clientX - rect.left) * width / rect.width - paddleWidth / 2));
        if (serving) ball.x = paddle + paddleWidth / 2;
        drawBreaker();
    }
    canvas.addEventListener("pointerdown", event => {
        if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
        dragPointer = event.pointerId; canvas.setPointerCapture?.(event.pointerId);
        movePointer(event); canvas.focus({ preventScroll: true }); event.preventDefault();
    });
    canvas.addEventListener("pointermove", event => {
        if (dragPointer === event.pointerId || event.pointerType === "mouse") movePointer(event);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(type, () => { dragPointer = null; });
    byId("breakerRestart").addEventListener("click", () => { startBreaker(); onStateChange(); });
    byId("breakerPause").addEventListener("click", () => controlBreaker("action"));

    startMemory(); startBreaker();
    return {
        controlBreaker, drawBreaker,
        breakerState: () => ({ started, paused, over, won }),
        pause() { if (started && !over) paused = true; dragPointer = null; },
        sync(activeGame, hidden) {
            clearInterval(breakerTimer); breakerTimer = null;
            if (!hidden && activeGame === "breaker" && started && !paused && !over) breakerTimer = setInterval(stepBreaker, 16);
            if ((hidden || activeGame !== "memory") && mismatchTimer !== null) {
                clearTimeout(mismatchTimer); mismatchTimer = null; opened = []; renderMemory();
            }
        }
    };
}
