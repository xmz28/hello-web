// UI-facing regressions for matching, persistence, collisions and timer cleanup.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
    constructor() { this.handlers = {}; this.style = {}; this.dataset = {}; this.value = '6'; }
    addEventListener(type, fn) { this.handlers[type] = fn; }
    querySelector() { return null; }
    getBoundingClientRect() { return { left: 0, width: 360 }; }
    getContext() { return this.ctx; }
    focus() {}
}
function createHarness(storage = new Map(), blocked = false) {
    const elements = new Map(), timers = new Map(); let nextTimer = 0;
    const byId = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
    const ctx = { fillRect(x, y, w, h) { if (h === 10) this.paddle = x; }, strokeRect() {}, beginPath() {}, fill() {}, stroke() {}, arc(x, y) { this.ball = { x, y }; } };
    byId('breakerCanvas').ctx = ctx;
    const random = Object.create(Math); random.random = () => 0;
    const context = vm.createContext({
        document: { getElementById: byId }, Math: random,
        localStorage: { getItem(key) { if (blocked) throw Error('blocked'); return storage.get(key); }, setItem(key, value) { if (blocked) throw Error('blocked'); storage.set(key, value); } },
        setTimeout(fn) { const id = ++nextTimer; timers.set(id, { fn, interval: false }); return id; },
        setInterval(fn) { const id = ++nextTimer; timers.set(id, { fn, interval: true }); return id; },
        clearTimeout(id) { timers.delete(id); }, clearInterval(id) { timers.delete(id); }
    });
    const factory = vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../games-extra.js'), 'utf8') + ';createExtraGames;', context);
    let api, active = 'memory', hidden = false;
    api = factory({ color: (_, fallback) => fallback, onStateChange() { api?.sync(active, hidden); } });
    return {
        api, byId, timers, storage, ctx,
        flip(index) { byId('memoryBoard').handlers.click({ target: { closest: () => ({ dataset: { memory: String(index) } }) } }); },
        restart() { byId('memoryRestart').handlers.click(); },
        tick() { [...timers.values()].filter(t => t.interval).forEach(t => t.fn()); },
        timeout() { for (const [id, t] of [...timers]) if (!t.interval) { timers.delete(id); t.fn(); } },
        switchTo(value) { api.pause(); active = value; api.sync(active, hidden); },
        hide() { api.pause(); hidden = true; api.sync(active, hidden); },
        show() { hidden = false; api.sync(active, hidden); }
    };
}
const game = createHarness();
assert.equal(game.timers.size, 0, 'New games must wait for user input');
game.flip(0); game.flip(1);
assert.equal(game.byId('memoryMoves').textContent, 1);
assert.equal(game.timers.size, 1);
const locked = game.byId('memoryBoard').innerHTML;
game.flip(2);
assert.equal(game.byId('memoryBoard').innerHTML, locked, 'A mismatch must lock the third card');
game.restart(); game.timeout();
assert.equal(game.byId('memoryMoves').textContent, 0);
assert.equal(game.timers.size, 0, 'Restart cancels the pending mismatch');
for (let i = 0; i < 6; i++) { game.flip(i); game.flip(i + 6); }
assert.match(game.byId('memoryMessage').textContent, /6/);
assert.equal((game.byId('memoryBoard').innerHTML.match(/disabled/g) || []).length, 12, 'All six pairs must lock after winning');
assert.equal(game.byId('memoryBest').textContent, 6);
assert.equal(createHarness(game.storage).byId('memoryBest').textContent, 6, 'A new session restores best moves');
game.byId('memoryDifficulty').value = '10';
game.byId('memoryDifficulty').handlers.change();
assert.equal((game.byId('memoryBoard').innerHTML.match(/data-memory=/g) || []).length, 20);
game.flip(0); game.flip(1); game.switchTo('breaker');
assert.equal(game.timers.size, 0, 'Switching games clears memory mismatch timers');
game.api.controlBreaker('action');
assert.equal(game.timers.size, 1);
game.hide(); assert.equal(game.timers.size, 0);
game.show(); assert.equal(game.timers.size, 0, 'Returning must not silently resume');
assert.equal(game.api.breakerState().paused, true);
game.api.controlBreaker('action');
for (let life = 2; life >= 0; life--) {
    for (let i = 0; i < 1500 && !game.api.breakerState().paused && !game.api.breakerState().over; i++) game.tick();
    assert.equal(game.byId('breakerLives').textContent, life, 'Missing the paddle loses exactly one life');
    assert.equal(game.timers.size, 0, 'A lost ball stops the timer until resumed');
    if (life) game.api.controlBreaker('action');
}
assert.equal(game.api.breakerState().over, true);
assert.ok(game.byId('breakerScore').textContent > 0, 'Brick collisions award points');
const savedBest = game.byId('breakerBest').textContent;
assert.equal(createHarness(game.storage).byId('breakerBest').textContent, savedBest);
game.byId('breakerRestart').handlers.click();
assert.equal(game.byId('breakerLives').textContent, 3);
assert.equal(game.api.breakerState().started, false);
assert.equal(game.timers.size, 0);
const winner = createHarness();
winner.switchTo('breaker'); winner.api.controlBreaker('action');
for (let i = 0; i < 60000 && !winner.api.breakerState().over; i++) {
    winner.byId('breakerCanvas').handlers.pointermove({ pointerType: 'mouse', clientX: winner.ctx.ball.x - Math.sin(i / 120) * 22 });
    winner.tick();
    if (winner.api.breakerState().paused) winner.api.controlBreaker('action');
}
assert.equal(winner.api.breakerState().won, true, 'The brick layout must be clearable');
assert.equal(winner.byId('breakerScore').textContent, 300, 'Every brick scores exactly once');
assert.equal(winner.timers.size, 0, 'Winning must stop the timer');
const touch = createHarness(); touch.switchTo('breaker');
const touchCanvas = touch.byId('breakerCanvas');
touchCanvas.getBoundingClientRect = () => ({ left: 10, width: 180 });
touchCanvas.handlers.pointerdown({ isPrimary: true, pointerType: 'touch', pointerId: 7, clientX: 100, preventDefault() {} });
assert.equal(touch.ctx.paddle, 142, 'Touch coordinates must scale from the displayed canvas');
touchCanvas.handlers.pointermove({ pointerType: 'touch', pointerId: 8, clientX: 180 });
assert.equal(touch.ctx.paddle, 142, 'Another finger must not move the active paddle');
touchCanvas.handlers.pointermove({ pointerType: 'touch', pointerId: 7, clientX: 180 });
assert.equal(touch.ctx.paddle, 284, 'The paddle must clamp at the right edge');
touchCanvas.handlers.pointerup();
touchCanvas.handlers.pointermove({ pointerType: 'touch', pointerId: 7, clientX: 10 });
assert.equal(touch.ctx.paddle, 284, 'Releasing a drag must stop touch movement');
touch.api.controlBreaker('action');
const flightPosition = { ...touch.ctx.ball };
touchCanvas.handlers.pointermove({ pointerType: 'mouse', clientX: 10 });
assert.deepEqual(touch.ctx.ball, flightPosition, 'Moving the paddle must not teleport an in-flight ball');
touch.api.pause(); touch.api.sync('breaker', false);
touchCanvas.handlers.pointermove({ pointerType: 'mouse', clientX: 180 });
assert.equal(touch.ctx.paddle, 0, 'A manual pause must hold the paddle in place');
const privateGame = createHarness(new Map(), true);
for (let i = 0; i < 6; i++) { privateGame.flip(i); privateGame.flip(i + 6); }
assert.equal(privateGame.byId('memoryBest').textContent, 6, 'Storage failures must not block playing or session records');
console.log('Passed: memory lock/match/win/reset/difficulty, local records, storage fallback, brick collision/lives, pause and timer cleanup.');
