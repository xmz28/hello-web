setupSiteControls();

const panels = {
    snake: document.getElementById("snakePanel"),
    "2048": document.getElementById("game2048Panel"),
    tetris: document.getElementById("tetrisPanel"),
    mines: document.getElementById("minesPanel"),
    flappy: document.getElementById("flappyPanel"),
    gobang: document.getElementById("gobangPanel"),
    huarong: document.getElementById("huarongPanel")
};
function gameColor(name, fallback) {
    if (typeof getComputedStyle !== "function") return fallback;
    return getComputedStyle(document.body).getPropertyValue(name).trim() || fallback;
}
let activeGame = "snake";
const gamepad = document.querySelector(".mobile-gamepad");
const actionControl = gamepad.querySelector('[data-control="action"]');
Object.values(panels).forEach((panel) => {
    panel.tabIndex = -1;
    panel.querySelectorAll(".game-message").forEach((message) => message.setAttribute("role", "status"));
});

function focusGame() {
    panels[activeGame].focus({ preventScroll: true });
}

function setMessage(id, text) {
    const message = document.getElementById(id);
    message.textContent = text;
    message.hidden = !text;
}

function updateGameControls() {
    const states = {
        snake: { started: snakeStarted, paused: snakePaused, over: snakeOver, message: "snakeMessage", button: "snakePause" },
        tetris: { started: tStarted, paused: tPaused, over: tOver, message: "tetrisMessage", button: "tetrisPause" },
        flappy: { started: flappyStarted, paused: flappyPaused, over: flappyOver, message: "flappyMessage", button: "flappyPause" }
    };
    Object.entries(states).forEach(([game, state]) => {
        const button = document.getElementById(state.button);
        button.textContent = !state.started ? "开始游戏" : state.paused ? "继续游戏" : "暂停";
        button.disabled = state.over;
        button.setAttribute("aria-pressed", String(state.paused));
        if (!state.over) setMessage(state.message, !state.started
            ? (game === "flappy" ? "点击画面、起飞或空格开始" : "点击开始游戏，或按方向键开始")
            : state.paused ? "已暂停，点击继续游戏恢复" : "");
    });
    actionControl.textContent = activeGame === "flappy" ? "起飞"
        : states[activeGame]?.paused ? "继续" : states[activeGame]?.started ? "暂停" : "开始";
    actionControl.setAttribute("aria-label", activeGame === "flappy" ? "起飞或重新起飞" : actionControl.textContent + "游戏");
    document.querySelectorAll(".game-item").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.game === activeGame));
        button.setAttribute("aria-controls", panels[button.dataset.game].id);
    });
}

function mountGamepad() {
    gamepad.hidden = ["mines", "gobang"].includes(activeGame);
    gamepad.classList.toggle("flight-controls", activeGame === "flappy");
    gamepad.querySelectorAll('[data-control]:not([data-control="action"])').forEach((button) => {
        button.hidden = activeGame === "flappy";
    });
    actionControl.hidden = ["2048", "huarong"].includes(activeGame);
    panels[activeGame].append(gamepad);
}

document.querySelectorAll(".game-item").forEach((item) => {
    item.addEventListener("click", () => {
        pauseRealtimeGames();
        activeGame = item.dataset.game;
        document.querySelectorAll(".game-item").forEach((button) => button.classList.remove("active"));
        Object.values(panels).forEach((panel) => panel.classList.remove("active"));
        item.classList.add("active");
        panels[activeGame].classList.add("active");
        mountGamepad();
        syncRealtimeTimers();
        focusGame();
    });
});

document.querySelectorAll("[data-control]").forEach((button) => {
    button.addEventListener("click", () => {
        handleControl(button.dataset.control);
        focusGame();
    });
});

function handleControl(action) {
    if (activeGame === "snake") controlSnake(action);
    if (activeGame === "2048") move2048({ up: "up", down: "down", left: "left", right: "right" }[action]);
    if (activeGame === "tetris") controlTetris(action);
    if (activeGame === "flappy" && action === "action") flap();
    if (activeGame === "huarong") moveHuarongByControl(action);
}

const snakeCanvas = document.getElementById("snakeCanvas");
const snakeCtx = snakeCanvas.getContext("2d");
const snakeSize = 18;
const snakeTiles = snakeCanvas.width / snakeSize;
let snake, snakeDir, nextSnakeDir, snakeFood, snakeScore, snakePaused = false, snakeOver = false, snakeStarted = false, snakeTimer;

function placeSnakeFood() {
    const occupied = new Set(snake.map((part) => part.y * snakeTiles + part.x));
    const empty = [];
    for (let i = 0; i < snakeTiles * snakeTiles; i++) if (!occupied.has(i)) empty.push(i);
    if (!empty.length) {
        snakeFood = null;
        snakeOver = true;
        setMessage("snakeMessage", "你赢了！已填满整个棋盘");
        syncRealtimeTimers();
        return;
    }
    const i = empty[Math.floor(Math.random() * empty.length)];
    snakeFood = { x: i % snakeTiles, y: Math.floor(i / snakeTiles) };
}

function drawSnake() {
    snakeCtx.fillStyle = gameColor("--game-canvas", "#081321");
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    snakeCtx.fillStyle = gameColor("--game-food", "#ff70c8");
    if (snakeFood) snakeCtx.fillRect(snakeFood.x * snakeSize + 2, snakeFood.y * snakeSize + 2, snakeSize - 4, snakeSize - 4);
    snakeCtx.fillStyle = gameColor("--game-snake", "#6ee7f9");
    snake.forEach((part, index) => {
        snakeCtx.globalAlpha = index === 0 ? 1 : 0.82;
        snakeCtx.fillRect(part.x * snakeSize + 2, part.y * snakeSize + 2, snakeSize - 4, snakeSize - 4);
    });
    snakeCtx.globalAlpha = 1;
}

function stepSnake() {
    if (!snakeStarted || snakePaused || snakeOver) return;
    snakeDir = nextSnakeDir;
    const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };
    const willEat = head.x === snakeFood.x && head.y === snakeFood.y;
    const collisionBody = willEat ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.y < 0 || head.x >= snakeTiles || head.y >= snakeTiles || collisionBody.some((part) => part.x === head.x && part.y === head.y)) {
        snakeOver = true;
        setMessage("snakeMessage", "游戏结束：撞到墙或身体，请重新开始");
        syncRealtimeTimers();
        return;
    }
    snake.unshift(head);
    if (willEat) {
        snakeScore += 10;
        document.getElementById("snakeScore").textContent = snakeScore;
        placeSnakeFood();
    } else {
        snake.pop();
    }
    drawSnake();
}

function restartSnake() {
    clearInterval(snakeTimer);
    snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
    snakeDir = { x: 1, y: 0 };
    nextSnakeDir = { x: 1, y: 0 };
    snakeScore = 0;
    snakePaused = false;
    snakeOver = false;
    snakeStarted = false;
    document.getElementById("snakeMessage").hidden = true;
    document.getElementById("snakeScore").textContent = snakeScore;
    placeSnakeFood();
    drawSnake();
    syncRealtimeTimers();
}

function toggleSnakePause() {
    if (snakeOver) return;
    if (!snakeStarted) snakeStarted = true;
    else snakePaused = !snakePaused;
    syncRealtimeTimers();
}

function controlSnake(action) {
    if (snakeOver) return;
    if (action === "action") { toggleSnakePause(); return; }
    if (snakePaused) return;
    if (!snakeStarted) { snakeStarted = true; syncRealtimeTimers(); }
    if (action === "up" && snakeDir.y === 0) nextSnakeDir = { x: 0, y: -1 };
    if (action === "down" && snakeDir.y === 0) nextSnakeDir = { x: 0, y: 1 };
    if (action === "left" && snakeDir.x === 0) nextSnakeDir = { x: -1, y: 0 };
    if (action === "right" && snakeDir.x === 0) nextSnakeDir = { x: 1, y: 0 };

}

const board2048 = document.getElementById("board2048");
let grid2048, score2048, game2048Over = false, game2048Won = false;

function start2048() {
    grid2048 = Array.from({ length: 4 }, () => Array(4).fill(0));
    score2048 = 0;
    game2048Over = false;
    game2048Won = false;
    document.getElementById("game2048Message").hidden = true;
    addTile2048();
    addTile2048();
    render2048();
}

function addTile2048() {
    const empty = [];
    grid2048.forEach((row, r) => row.forEach((value, c) => {
        if (!value) empty.push([r, c]);
    }));
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid2048[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function compact2048(row) {
    const values = row.filter(Boolean);
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i] === values[i + 1]) {
            values[i] *= 2;
            score2048 += values[i];
            values.splice(i + 1, 1);
        }
    }
    while (values.length < 4) values.push(0);
    return values;
}

function move2048(dir) {
    if (!dir || game2048Over) return;
    const before = JSON.stringify(grid2048);
    if (dir === "left") grid2048 = grid2048.map(compact2048);
    if (dir === "right") grid2048 = grid2048.map((row) => compact2048([...row].reverse()).reverse());
    if (dir === "up" || dir === "down") {
        for (let c = 0; c < 4; c++) {
            let column = grid2048.map((row) => row[c]);
            if (dir === "down") column.reverse();
            column = compact2048(column);
            if (dir === "down") column.reverse();
            for (let r = 0; r < 4; r++) grid2048[r][c] = column[r];
        }
    }
    if (before !== JSON.stringify(grid2048)) addTile2048();
    update2048State();
    render2048();
}

function update2048State() {
    const message = document.getElementById("game2048Message");
    if (!game2048Won && grid2048.flat().some((value) => value >= 2048)) {
        game2048Won = true;
        message.textContent = "达到 2048！你可以继续游戏";
        message.hidden = false;
    }
    const hasEmpty = grid2048.some((row) => row.some((value) => !value));
    const canMerge = grid2048.some((row, r) => row.some((value, c) =>
        (c < 3 && value === row[c + 1]) || (r < 3 && value === grid2048[r + 1][c])
    ));
    if (!hasEmpty && !canMerge) {
        game2048Over = true;
        message.textContent = "游戏结束：没有可用移动";
        message.hidden = false;
    }
}

function render2048() {
    document.getElementById("score2048").textContent = score2048;
    board2048.innerHTML = grid2048.flat().map((value) => `<div class="tile tile-${value}">${value || ""}</div>`).join("");
}

const tetrisCanvas = document.getElementById("tetrisCanvas");
const tetrisCtx = tetrisCanvas.getContext("2d");
const tetrisNextCanvas = document.getElementById("tetrisNextCanvas");
const tetrisNextCtx = tetrisNextCanvas.getContext("2d");
const tSize = 20;
const tCols = 12;
const tRows = 20;
const pieces = [
    [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]]
];
let tBoard, tPiece, tNextPiece, tScore, tTimer, tPaused = false, tOver = false, tStarted = false;

function createTetrisPiece() {
    const shape = pieces[Math.floor(Math.random() * pieces.length)].map((row) => [...row]);
    return { shape, color: `hsl(${Math.random() * 360}, 80%, 68%)` };
}

function newPiece() {
    const current = tNextPiece || createTetrisPiece();
    tPiece = { shape: current.shape, x: 4, y: 0, color: current.color };
    tNextPiece = createTetrisPiece();
    drawTetrisNext();
    if (collides(tPiece.x, tPiece.y, tPiece.shape)) {
        tOver = true;
        setMessage("tetrisMessage", "游戏结束：方块堆满，请重新开始");
        syncRealtimeTimers();
    }
}

function collides(x, y, shape) {
    return shape.some((row, r) => row.some((cell, c) => {
        if (!cell) return false;
        const nx = x + c;
        const ny = y + r;
        return nx < 0 || nx >= tCols || ny >= tRows || (ny >= 0 && tBoard[ny][nx]);
    }));
}

function mergePiece() {
    tPiece.shape.forEach((row, r) => row.forEach((cell, c) => {
        if (cell && tPiece.y + r >= 0) tBoard[tPiece.y + r][tPiece.x + c] = tPiece.color;
    }));
}

function clearLines() {
    for (let r = tRows - 1; r >= 0; r--) {
        if (tBoard[r].every(Boolean)) {
            tBoard.splice(r, 1);
            tBoard.unshift(Array(tCols).fill(0));
            tScore += 100;
            r++;
        }
    }
    document.getElementById("tetrisScore").textContent = tScore;
}

function drawTetris() {
    tetrisCtx.fillStyle = gameColor("--game-canvas", "#081321");
    tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
    tBoard.forEach((row, r) => row.forEach((color, c) => color && drawBlock(c, r, color)));
    tPiece.shape.forEach((row, r) => row.forEach((cell, c) => cell && drawBlock(tPiece.x + c, tPiece.y + r, tPiece.color)));
}

function drawBlock(x, y, color) {
    tetrisCtx.fillStyle = color;
    tetrisCtx.fillRect(x * tSize + 1, y * tSize + 1, tSize - 2, tSize - 2);
}

function drawTetrisNext() {
    tetrisNextCtx.clearRect(0, 0, tetrisNextCanvas.width, tetrisNextCanvas.height);
    tetrisNextCtx.fillStyle = gameColor("--game-canvas", "rgba(5, 12, 22, 0.82)");
    tetrisNextCtx.fillRect(0, 0, tetrisNextCanvas.width, tetrisNextCanvas.height);
    if (!tNextPiece) return;
    const previewSize = 16;
    const shapeWidth = tNextPiece.shape[0].length * previewSize;
    const shapeHeight = tNextPiece.shape.length * previewSize;
    const offsetX = Math.floor((tetrisNextCanvas.width - shapeWidth) / 2);
    const offsetY = Math.floor((tetrisNextCanvas.height - shapeHeight) / 2);
    tetrisNextCtx.fillStyle = tNextPiece.color;
    tNextPiece.shape.forEach((row, r) => row.forEach((cell, c) => {
        if (cell) tetrisNextCtx.fillRect(offsetX + c * previewSize + 1, offsetY + r * previewSize + 1, previewSize - 2, previewSize - 2);
    }));
}

function dropTetris() {
    if (!tStarted || tPaused || tOver) return;
    if (!collides(tPiece.x, tPiece.y + 1, tPiece.shape)) {
        tPiece.y++;
    } else {
        mergePiece();
        clearLines();
        newPiece();
    }
    drawTetris();
}

function rotatePiece() {
    const rotated = tPiece.shape[0].map((_, c) => tPiece.shape.map((row) => row[c]).reverse());
    if (!collides(tPiece.x, tPiece.y, rotated)) tPiece.shape = rotated;
    drawTetris();
}

function controlTetris(action) {
    if (tOver) return;
    if (action === "action") {
        toggleTetrisPause();
        return;
    }
    if (tPaused) return;
    if (!tStarted) { tStarted = true; syncRealtimeTimers(); }
    if (action === "up") rotatePiece();
    if (action === "left" && !collides(tPiece.x - 1, tPiece.y, tPiece.shape)) tPiece.x--;
    if (action === "right" && !collides(tPiece.x + 1, tPiece.y, tPiece.shape)) tPiece.x++;
    if (action === "down") dropTetris();
    drawTetris();
}

function toggleTetrisPause() {
    if (tOver) return;
    if (!tStarted) tStarted = true;
    else tPaused = !tPaused;
    syncRealtimeTimers();
}

function startTetris() {
    clearInterval(tTimer);
    tBoard = Array.from({ length: tRows }, () => Array(tCols).fill(0));
    tScore = 0;
    tPaused = false;
    tOver = false;
    tStarted = false;
    tNextPiece = null;
    document.getElementById("tetrisMessage").hidden = true;
    document.getElementById("tetrisScore").textContent = tScore;
    newPiece();
    drawTetris();
    syncRealtimeTimers();
}

const minesBoard = document.getElementById("minesBoard");
let mines = [];
let mineDone = false;
let mineFlagMode = false;
let mineHoldTimer, minePress, suppressMineClick = false;

function toggleMineFlagMode() {
    mineFlagMode = !mineFlagMode;
    document.getElementById("mineFlagMode").setAttribute("aria-pressed", String(mineFlagMode));
    document.getElementById("mineFlagMode").textContent = "标记模式：" + (mineFlagMode ? "开" : "关");
}
function flagMine(i) {
    if (mineDone || mines[i].open) return;
    mines[i].flag = !mines[i].flag;
    renderMines();
}
function startMines() {
    mineDone = false;
    clearTimeout(mineHoldTimer);
    minePress = null;
    suppressMineClick = false;
    if (mineFlagMode) toggleMineFlagMode();
    document.getElementById("minesMessage").hidden = true;
    mines = Array.from({ length: 64 }, (_, i) => ({ i, mine: false, open: false, flag: false, n: 0 }));
    const shuffled = [...mines];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.slice(0, 10).forEach((cell) => cell.mine = true);
    mines.forEach((cell) => {
        const r = Math.floor(cell.i / 8), c = cell.i % 8;
        cell.n = neighbors8(r, c).filter(([nr, nc]) => mines[nr * 8 + nc].mine).length;
    });
    renderMines();
}
function neighbors8(r, c) {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if ((dr || dc) && nr >= 0 && nc >= 0 && nr < 8 && nc < 8) out.push([nr, nc]);
    }
    return out;
}
function openMine(i) {
    if (mineDone || mines[i].flag || mines[i].open) return;
    mines[i].open = true;
    if (mines[i].mine) {
        mineDone = true;
        mines.forEach((cell) => cell.open = true);
        const message = document.getElementById("minesMessage");
        message.textContent = "游戏结束：踩到地雷";
        message.hidden = false;
    } else if (!mines[i].n) {
        const r = Math.floor(i / 8), c = i % 8;
        neighbors8(r, c).forEach(([nr, nc]) => openMine(nr * 8 + nc));
    }
    if (!mineDone && mines.filter((cell) => !cell.mine).every((cell) => cell.open)) {
        mineDone = true;
        const message = document.getElementById("minesMessage");
        message.textContent = "你赢了！";
        message.hidden = false;
    }
    renderMines();
}
function renderMines() {
    document.getElementById("mineCount").textContent = Math.max(0, mines.filter((cell) => cell.mine).length - mines.filter((cell) => cell.flag).length);
    const focused = document.activeElement?.dataset.mine;
    minesBoard.innerHTML = mines.map((cell) => {
        const state = cell.open ? (cell.mine ? "地雷" : `已打开，周围 ${cell.n} 个雷`) : cell.flag ? "已标记" : "未打开";
        return `<button type="button" aria-label="第 ${Math.floor(cell.i / 8) + 1} 行第 ${cell.i % 8 + 1} 列，${state}" class="${cell.open ? "open" : ""}" data-mine="${cell.i}">${cell.open ? (cell.mine ? "💣" : cell.n || "") : cell.flag ? "🚩" : ""}</button>`;
    }).join("");
    if (focused !== undefined) minesBoard.querySelector(`[data-mine="${focused}"]`)?.focus({ preventScroll: true });
}
minesBoard.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-mine]");
    if (suppressMineClick && event.detail !== 0) { suppressMineClick = false; return; }
    if (btn) (mineFlagMode ? flagMine : openMine)(Number(btn.dataset.mine));
});
minesBoard.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const btn = event.target.closest("[data-mine]");
    clearTimeout(mineHoldTimer);
    if (!btn || mineDone || suppressMineClick) return;
    if (minePress) suppressMineClick = true;
    flagMine(Number(btn.dataset.mine));
});
minesBoard.addEventListener("pointerdown", (event) => {
    suppressMineClick = false;
    const btn = event.target.closest("[data-mine]");
    if (!btn || event.pointerType === "mouse" || mineDone) return;
    minePress = { id: event.pointerId, i: Number(btn.dataset.mine), x: event.clientX, y: event.clientY };
    mineHoldTimer = setTimeout(() => {
        suppressMineClick = true;
        flagMine(minePress.i);
    }, 500);
});
minesBoard.addEventListener("pointermove", (event) => {
    if (minePress && Math.hypot(event.clientX - minePress.x, event.clientY - minePress.y) > 10) clearTimeout(mineHoldTimer);
});
for (const type of ["pointerup", "pointercancel"]) document.addEventListener(type, () => {
    clearTimeout(mineHoldTimer);
    minePress = null;
});

const flappyCanvas = document.getElementById("flappyCanvas");
const fCtx = flappyCanvas.getContext("2d");
let bird, pipes, flappyScore, flappyTimer, flappyOver, flappyStarted = false, flappyPaused = false;
function startFlappy() {
    clearInterval(flappyTimer);
    bird = { x: 80, y: 190, v: 0 };
    pipes = [];
    flappyScore = 0;
    flappyOver = false;
    flappyStarted = false;
    flappyPaused = false;
    document.getElementById("flappyScore").textContent = 0;
    drawFlappy();
    syncRealtimeTimers();
}
function flap() {
    if (flappyOver) startFlappy();
    flappyStarted = true;
    flappyPaused = false;
    bird.v = -7;
    syncRealtimeTimers();
}
function toggleFlappyPause() {
    if (flappyOver) return;
    if (!flappyStarted) { flap(); return; }
    flappyPaused = !flappyPaused;
    syncRealtimeTimers();
}
flappyCanvas.addEventListener("click", () => { flap(); focusGame(); });
function stepFlappy() {
    if (!flappyStarted || flappyPaused || flappyOver) return;
    bird.v += 0.45;
    bird.y += bird.v;
    if (!pipes.length || pipes[pipes.length - 1].x < 190) pipes.push({ x: 360, gap: 110 + Math.random() * 170, passed: false });
    pipes.forEach((p) => p.x -= 2.4);
    pipes = pipes.filter((p) => p.x > -50);
    pipes.forEach((p) => {
        if (!p.passed && p.x + 46 < bird.x - 14) {
            p.passed = true;
            flappyScore++;
            document.getElementById("flappyScore").textContent = flappyScore;
        }
    });
    flappyOver = bird.y - 14 < 0 || bird.y + 14 > flappyCanvas.height || pipes.some((p) =>
        bird.x + 14 > p.x && bird.x - 14 < p.x + 46
        && (bird.y - 14 < p.gap - 70 || bird.y + 14 > p.gap + 70)
    );
    drawFlappy();
    if (flappyOver) {
        setMessage("flappyMessage", `游戏结束，得分 ${flappyScore}。点击起飞或空格重试`);
        syncRealtimeTimers();
    }
}
function drawFlappy() {
    fCtx.fillStyle = gameColor("--game-canvas", "#081321");
    fCtx.fillRect(0, 0, 360, 420);
    fCtx.fillStyle = gameColor("--game-pipe", "#8df7b5");
    pipes.forEach((p) => {
        fCtx.fillRect(p.x, 0, 46, p.gap - 70);
        fCtx.fillRect(p.x, p.gap + 70, 46, 420);
    });
    fCtx.fillStyle = "#ffd166";
    fCtx.beginPath();
    fCtx.arc(bird.x, bird.y, 14, 0, Math.PI * 2);
    fCtx.fill();
}

const gobangCanvas = document.getElementById("gobangCanvas");
const gCtx = gobangCanvas.getContext("2d");
let gobang, gobangTurn, gobangOver, gobangMode = "pvp", gobangAiTimer;
let gobangCursor = { r: 7, c: 7 };
gobangCanvas.tabIndex = 0;
gobangCanvas.setAttribute("role", "button");

function updateGobangLabel() {
    const { r, c } = gobangCursor;
    const value = gobang[r][c];
    gobangCanvas.setAttribute("aria-label", `五子棋棋盘，第 ${r + 1} 行第 ${c + 1} 列，${value === 1 ? "黑棋" : value === 2 ? "白棋" : "空位"}。方向键选择，回车或空格落子`);
}
function startGobang() {
    clearTimeout(gobangAiTimer);
    gobangAiTimer = null;
    gobangCursor = { r: 7, c: 7 };
    document.getElementById("gobangPvp").setAttribute("aria-pressed", String(gobangMode === "pvp"));
    document.getElementById("gobangAi").setAttribute("aria-pressed", String(gobangMode === "ai"));
    gobang = Array.from({ length: 15 }, () => Array(15).fill(0));
    gobangTurn = 1;
    gobangOver = false;
    document.getElementById("gobangStatus").textContent = gobangMode === "ai" ? "人机对局：你执黑" : "人人对局：黑棋先手";
    drawGobang();
}

function setGobangMode(mode) {
    gobangMode = mode;
    startGobang();
}
function drawGobang() {
    gCtx.fillStyle = "#e6dfce";
    gCtx.fillRect(0, 0, 420, 420);
    gCtx.strokeStyle = "rgba(31,41,51,.5)";
    for (let i = 0; i < 15; i++) {
        gCtx.beginPath();
        gCtx.moveTo(14 + i * 28, 14);
        gCtx.lineTo(14 + i * 28, 406);
        gCtx.moveTo(14, 14 + i * 28);
        gCtx.lineTo(406, 14 + i * 28);
        gCtx.stroke();
    }
    gobang.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        gCtx.fillStyle = v === 1 ? "#111827" : "#f8fafc";
        gCtx.beginPath();
        gCtx.arc(14 + c * 28, 14 + r * 28, 11, 0, Math.PI * 2);
        gCtx.fill();
    }));
    if (document.activeElement === gobangCanvas) {
        gCtx.strokeStyle = "#176b99";
        gCtx.lineWidth = 2;
        gCtx.strokeRect(2 + gobangCursor.c * 28, 2 + gobangCursor.r * 28, 24, 24);
        gCtx.lineWidth = 1;
    }
    updateGobangLabel();
}
gobangCanvas.addEventListener("click", (event) => {
    if (gobangOver || (gobangMode === "ai" && gobangTurn === 2)) return;
    const rect = gobangCanvas.getBoundingClientRect();
    const canvasX = (event.clientX - rect.left) * (gobangCanvas.width / rect.width);
    const canvasY = (event.clientY - rect.top) * (gobangCanvas.height / rect.height);
    const c = Math.round((canvasX - 14) / 28);
    const r = Math.round((canvasY - 14) / 28);
    if (r < 0 || c < 0 || r >= 15 || c >= 15 || gobang[r][c]) return;
    gobangCursor = { r, c };
    submitGobangMove(r, c);
});
function submitGobangMove(r, c) {
    if (gobangOver || gobang[r][c] || (gobangMode === "ai" && gobangTurn === 2)) return;
    placeGobang(r, c);
    if (gobangMode === "ai" && !gobangOver) gobangAiTimer = setTimeout(aiGobangMove, 220);
}
gobangCanvas.addEventListener("focus", drawGobang);
gobangCanvas.addEventListener("blur", drawGobang);
gobangCanvas.addEventListener("keydown", (event) => {
    const directions = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (!directions[event.key] && !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (directions[event.key]) {
        const [dr, dc] = directions[event.key];
        gobangCursor.r = Math.max(0, Math.min(14, gobangCursor.r + dr));
        gobangCursor.c = Math.max(0, Math.min(14, gobangCursor.c + dc));
        drawGobang();
    } else if (!event.repeat) submitGobangMove(gobangCursor.r, gobangCursor.c);
});

function placeGobang(r, c) {
    gobang[r][c] = gobangTurn;
    if (checkGobang(r, c, gobangTurn)) {
        gobangOver = true;
        document.getElementById("gobangStatus").textContent = gobangTurn === 1 ? "黑棋胜利" : "白棋胜利";
    } else if (gobang.every((row) => row.every(Boolean))) {
        gobangOver = true;
        document.getElementById("gobangStatus").textContent = "和棋";
    } else {
        gobangTurn = 3 - gobangTurn;
        document.getElementById("gobangStatus").textContent = gobangMode === "ai"
            ? (gobangTurn === 1 ? "你的回合" : "AI 思考中")
            : (gobangTurn === 1 ? "黑棋回合" : "白棋回合");
    }
    drawGobang();
}

function aiGobangMove() {
    if (gobangMode !== "ai" || gobangOver || gobangTurn !== 2) return;
    const move = findBestGobangMove();
    if (!move) return;
    const [r, c] = move;
    placeGobang(r, c);
}

function findBestGobangMove() {
    const empty = [];
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (!gobang[r][c]) empty.push([r, c]);
        }
    }
    const best = empty
        .map(([r, c]) => [scoreGobangPoint(r, c, 2) + scoreGobangPoint(r, c, 1) * 0.92, r, c])
        .sort((a, b) => b[0] - a[0])[0];
    return best ? best.slice(1) : null;
}

function scoreGobangPoint(r, c, player) {
    return [[1, 0], [0, 1], [1, 1], [1, -1]].reduce((score, [dr, dc]) => {
        let count = 1;
        let open = 0;
        for (const sign of [-1, 1]) {
            let nr = r + dr * sign;
            let nc = c + dc * sign;
            while (gobang[nr] && gobang[nr][nc] === player) {
                count++;
                nr += dr * sign;
                nc += dc * sign;
            }
            if (gobang[nr] && gobang[nr][nc] === 0) open++;
        }
        if (count >= 5) return score + 100000;
        if (count === 4 && open) return score + 12000;
        if (count === 3 && open === 2) return score + 2500;
        if (count === 3 && open === 1) return score + 800;
        if (count === 2 && open === 2) return score + 220;
        return score + count * 18 + open * 8;
    }, centerBonus(r, c));
}

function centerBonus(r, c) {
    return 14 - Math.abs(7 - r) - Math.abs(7 - c);
}
function checkGobang(r, c, v) {
    return [[1, 0], [0, 1], [1, 1], [1, -1]].some(([dr, dc]) => {
        let count = 1;
        for (const sign of [-1, 1]) {
            let nr = r + dr * sign, nc = c + dc * sign;
            while (gobang[nr] && gobang[nr][nc] === v) {
                count++;
                nr += dr * sign;
                nc += dc * sign;
            }
        }
        return count >= 5;
    });
}

const huarongBoard = document.getElementById("huarongBoard");
let huarong, huarongSteps, huarongWon;
function startHuarong() {
    huarongSteps = 0;
    huarongWon = false;
    document.getElementById("huarongMessage").hidden = true;
    do {
        huarong = [1, 2, 3, 4, 5, 6, 7, 8, ""];
        for (let i = 0; i < 60; i++) moveHuarongByControl(["up", "down", "left", "right"][Math.floor(Math.random() * 4)], true);
    } while (huarong.join(",") === "1,2,3,4,5,6,7,8,");
    renderHuarong();
}
function moveHuarongByControl(action, silent = false) {
    if (huarongWon && !silent) return;
    const empty = huarong.indexOf("");
    const r = Math.floor(empty / 3), c = empty % 3;
    const target = { up: [r + 1, c], down: [r - 1, c], left: [r, c + 1], right: [r, c - 1] }[action];
    if (!target) return;
    const [tr, tc] = target;
    if (tr < 0 || tc < 0 || tr > 2 || tc > 2) return;
    const ti = tr * 3 + tc;
    [huarong[empty], huarong[ti]] = [huarong[ti], huarong[empty]];
    if (!silent) {
        huarongSteps++;
        checkHuarongWin();
        renderHuarong();
    }
}
huarongBoard.addEventListener("click", (event) => {
    if (huarongWon) return;
    const tile = event.target.closest("[data-huarong]");
    if (!tile) return;
    const i = Number(tile.dataset.huarong);
    const e = huarong.indexOf("");
    if (Math.abs(Math.floor(i / 3) - Math.floor(e / 3)) + Math.abs(i % 3 - e % 3) === 1) {
        [huarong[i], huarong[e]] = [huarong[e], huarong[i]];
        huarongSteps++;
        checkHuarongWin();
        renderHuarong();
    }
});
function checkHuarongWin() {
    if (huarong.join(",") === "1,2,3,4,5,6,7,8,") {
        huarongWon = true;
        document.getElementById("huarongMessage").hidden = false;
    }
}
function renderHuarong() {
    document.getElementById("huarongSteps").textContent = huarongSteps;
    huarongBoard.style.gridTemplateColumns = "repeat(3, 1fr)";
    const focused = document.activeElement?.dataset.huarong;
    huarongBoard.innerHTML = huarong.map((value, i) => `<button type="button" aria-label="第 ${Math.floor(i / 3) + 1} 行第 ${i % 3 + 1} 列，${value ? `数字 ${value}` : "空位"}" ${value ? "" : "disabled"} data-huarong="${i}" class="${value ? "" : "empty"}">${value}</button>`).join("");
    if (focused !== undefined) huarongBoard.querySelector(`[data-huarong="${focused}"]:not([disabled])`)?.focus({ preventScroll: true });
}

function syncRealtimeTimers() {
    clearInterval(snakeTimer);
    clearInterval(tTimer);
    clearInterval(flappyTimer);
    snakeTimer = null;
    tTimer = null;
    flappyTimer = null;
    updateGameControls();
    if (document.hidden) return;
    if (activeGame === "snake" && snakeStarted && !snakePaused && !snakeOver) snakeTimer = setInterval(stepSnake, 120);
    if (activeGame === "tetris" && tStarted && !tPaused && !tOver) tTimer = setInterval(dropTetris, 600);
    if (activeGame === "flappy" && flappyStarted && !flappyPaused && !flappyOver) flappyTimer = setInterval(stepFlappy, 28);
}

function pauseRealtimeGames() {
    if (snakeStarted && !snakeOver) snakePaused = true;
    if (tStarted && !tOver) tPaused = true;
    if (flappyStarted && !flappyOver) flappyPaused = true;
}
document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseRealtimeGames();
    syncRealtimeTimers();
});
window.addEventListener("blur", () => { pauseRealtimeGames(); syncRealtimeTimers(); });

function enableSwipe(board, move) {
    let gesture = null;
    let suppressClick = false;
    board.addEventListener("pointerdown", (event) => {
        suppressClick = false;
        if (event.pointerType === "mouse" || !event.isPrimary) return;
        gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    board.addEventListener("pointerup", (event) => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        gesture = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
        suppressClick = true;
        event.preventDefault();
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
        focusGame();
    });
    board.addEventListener("pointercancel", () => { gesture = null; });
    board.addEventListener("click", (event) => {
        if (suppressClick && event.detail !== 0) {
            event.preventDefault();
            event.stopImmediatePropagation();
            suppressClick = false;
        }
    }, true);
}
enableSwipe(board2048, move2048);
enableSwipe(huarongBoard, moveHuarongByControl);
Object.values(panels).forEach((panel) => {
    panel.querySelectorAll(".game-actions button").forEach((button) => button.addEventListener("click", focusGame));
});

document.addEventListener("keydown", (event) => {
    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", " ": "action", Enter: "action" };
    const target = event.target;
    const isTyping = target instanceof Element
        && (target.closest("input, textarea, select") || target.closest("[contenteditable='true']"));
    const isNativeActivation = (event.key === " " || event.key === "Enter")
        && target instanceof Element
        && Boolean(target.closest("button, a"));
    const inGame = target instanceof Element && Boolean(target.closest(".game-panel"));
    if (map[event.key] && inGame && !isTyping && !isNativeActivation) {
        if (event.repeat && map[event.key] === "action") return;
        if (["mines", "gobang"].includes(activeGame)) return;
        event.preventDefault();
        handleControl(map[event.key]);
    }
});

restartSnake();
start2048();
startTetris();
startMines();
startFlappy();
startGobang();
startHuarong();
mountGamepad();
syncRealtimeTimers();
focusGame();
window.addEventListener("site-theme-change", () => {
    drawSnake();
    drawTetris();
    drawTetrisNext();
    drawFlappy();
});
