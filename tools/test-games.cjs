// Deterministic checks for game state, timer lifecycle and touch input regressions.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
    constructor(id = '') {
        this.id = id; this.dataset = {}; this.handlers = {}; this.attributes = {}; this.style = {};
        this.classList = { add() {}, remove() {}, toggle() {} };
        this.width = this.height = 420;
    }
    addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
    setAttribute(name, value) { this.attributes[name] = value; }
    querySelectorAll() { return []; }
    querySelector() { return null; }
    append() {}
    focus() { document.activeElement = this; }
    getContext() { return new Proxy({}, { get: () => () => {}, set: () => true }); }
    closest() { return this; }
}
const elements = new Map();
const document = new Element();
document.hidden = false;
document.getElementById = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
};
document.getElementById('snakeCanvas').width = 360;
const gamepad = new Element();
const controls = ['up', 'left', 'action', 'right', 'down'].map((action) => {
    const button = new Element(); button.dataset.control = action; return button;
});
gamepad.querySelector = () => controls[2];
gamepad.querySelectorAll = () => controls.filter((button) => button.dataset.control !== 'action');
document.querySelector = () => gamepad;
document.querySelectorAll = (selector) => selector === '[data-control]' ? controls : [];
const timers = new Map(); let nextTimer = 0;
const context = vm.createContext({
    document, window: new Element(), Element, setupSiteControls() {}, console,
    setInterval: (fn) => { const id = ++nextTimer; timers.set(id, fn); return id; },
    setTimeout: (fn) => { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearInterval: (id) => timers.delete(id), clearTimeout: (id) => timers.delete(id),
});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../games-extra.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../games.js'), 'utf8'), context);
const run = (code) => vm.runInContext(code, context);
const json = (code) => JSON.parse(run(`JSON.stringify(${code})`));
assert.equal(timers.size, 0, 'No game starts running during page initialization');
run('controlSnake("up")');
assert.equal(run('snakeStarted'), true);
assert.equal(timers.size, 1);
run('pauseRealtimeGames(); syncRealtimeTimers()');
assert.equal(timers.size, 0);
assert.equal(document.getElementById('snakePause').textContent, '继续游戏');
run('restartSnake(); snake = Array.from({length:400}, (_,i)=>({x:i%20,y:Math.floor(i/20)})); placeSnakeFood(); drawSnake()');
assert.equal(run('snakeOver'), true);
assert.equal(run('snakeFood'), null);
assert.match(document.getElementById('snakeMessage').textContent, /你赢了/);
run('score2048 = 0');
assert.deepEqual(json('compact2048([2,2,2,2])'), [4,4,0,0]);
assert.deepEqual(json('compact2048([4,4,8,0])'), [8,8,0,0]);
run('activeGame="flappy"; startFlappy()');
assert.equal(timers.size, 0);
assert.equal(run('bird.y'), 190);
run('flap(); stepFlappy()');
assert.equal(run('flappyStarted'), true);
assert.ok(run('bird.y') < 190);
run('toggleFlappyPause()');
assert.equal(timers.size, 0);
run('flap(); bird.y=500; stepFlappy()');
assert.equal(run('flappyOver'), true);
assert.equal(timers.size, 0);
assert.match(document.getElementById('flappyMessage').textContent, /游戏结束/);
run('flap(); document.hidden=true');
document.handlers.visibilitychange[0]();
assert.equal(timers.size, 0);
assert.equal(run('flappyPaused'), true);
document.hidden = false;
document.handlers.visibilitychange[0]();
assert.equal(timers.size, 0, 'Returning to page must not silently resume');
run('setGobangMode("ai"); submitGobangMove(7,7)');
assert.equal(timers.size, 1);
run('setGobangMode("pvp"); submitGobangMove(7,7); aiGobangMove()');
assert.equal(timers.size, 0);
assert.equal(run('gobang.flat().filter(Boolean).length'), 1);
run('startMines()');
const cell = new Element(); cell.dataset.mine = '0';
const board = document.getElementById('minesBoard');
board.handlers.pointerdown[0]({ target: cell, pointerType: 'touch', pointerId: 1, clientX: 0, clientY: 0 });
run('0');
timers.get(run('mineHoldTimer'))();
document.handlers.pointerup[0]();
board.handlers.click[0]({ target: cell, detail: 1 });
assert.equal(run('mines[0].flag'), true);
assert.equal(run('mines[0].open'), false, 'Long press must not also open the cell');
for (const first of [0, 27, 63]) {
    run('startMines(); openMine(' + first + ')');
    assert.equal(run('mines[' + first + '].mine'), false, 'The first reveal must be safe');
    assert.equal(run('mines[' + first + '].open'), true);
    assert.equal(run('mines[' + first + '].n'), 0, 'The neighboring cells must also be safe');
    assert.equal(run('mines.filter(cell => cell.mine).length'), 10, 'First-reveal safety must preserve the mine count');
}
run('startMines()');
const initiallyMined = run('mines.findIndex(cell => cell.mine)');
run('openMine(' + initiallyMined + ')');
assert.equal(run('mines[' + initiallyMined + '].mine'), false, 'An initially mined first cell must be relocated');
assert.equal(run('mines.filter(cell => cell.mine).length'), 10);
run('activeGame="2048"; grid2048=[[0,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]; game2048Over=false');
const swipeBoard = document.getElementById('board2048');
swipeBoard.handlers.pointerdown[0]({ pointerType: 'touch', isPrimary: true, pointerId: 2, clientX: 100, clientY: 100 });
swipeBoard.handlers.pointerup[0]({ pointerId: 2, clientX: 10, clientY: 100, preventDefault() {} });
assert.equal(run('grid2048[0][0]'), 2, 'Left swipe moves the tile');
assert.equal(run('grid2048.flat().filter(Boolean).length'), 2);
const themeState = '({snake, snakeScore, snakePaused, grid2048, score2048, mines, gobang, activeGame})';
const beforeTheme = json(themeState);
const beforeTimers = [...timers.keys()];
context.window.handlers['site-theme-change'][0]();
assert.deepEqual(json(themeState), beforeTheme, 'Theme repaint must preserve game progress and pause state');
assert.deepEqual([...timers.keys()], beforeTimers, 'Theme repaint must not start or stop timers');
run('activeGame="breaker"; handleControl("action")');
assert.equal(timers.size, 1, 'The shared controls must start Brick Breaker');
run('pauseRealtimeGames(); activeGame="memory"; syncRealtimeTimers()');
assert.equal(timers.size, 0, 'Switching to memory must pause Brick Breaker');
run('activeGame="breaker"; syncRealtimeTimers()');
assert.equal(timers.size, 0, 'Returning to Brick Breaker waits for explicit resume');
run('handleControl("action"); document.hidden=true');
document.handlers.visibilitychange[0]();
assert.equal(timers.size, 0, 'Hidden pages must stop Brick Breaker');
assert.equal(run('extraGames.breakerState().paused'), true);
const pausedBreaker = json('extraGames.breakerState()');
context.window.handlers['site-theme-change'][0]();
assert.deepEqual(json('extraGames.breakerState()'), pausedBreaker);
console.log('Passed: waiting states, pause/resume, full snake board, 2048 merges, Flappy lifecycle, visibility, AI cancellation, long press, swipe and theme repaint without state resets.');
