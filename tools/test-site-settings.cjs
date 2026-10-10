// Settings regressions: storage failures/synchronization, auto theme, page ARIA
// dictionaries, and giscus synchronization after its client removes the script.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const values = new Map();
let blocked = false;
const localStorage = {
    getItem(key) { if (blocked) throw new Error('Storage disabled'); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw new Error('Storage disabled'); values.set(key, value); }
};
class Element {
    constructor(dataset = {}) { this.dataset = dataset; this.attributes = {}; this.handlers = {}; this.textContent = ''; this.hidden = true; this.classList = { toggle() {} }; }
    setAttribute(key, value) { this.attributes[key] = String(value); }
    addEventListener(key, handler) { this.handlers[key] = handler; }
    closest() { return this; }
    querySelector() { return null; }
    contains() { return true; }
    focus() {}
}
const theme = new Element();
const toggle = new Element();
const panel = new Element();
const options = ['zh-CN', 'zh-TW', 'en', 'ja'].map(lang => new Element({ langOption: lang }));
const sortGroup = new Element({ i18nAria: 'sortLabel' });
sortGroup.textContent = 'All Newest first Oldest first Most viewed';
const heading = new Element({ i18n: 'home' });
const messages = [];
const frame = { contentWindow: { postMessage(message, origin) { messages.push({ message, origin }); } } };
const document = {
    documentElement: { dataset: {} },
    getElementById(id) { return { themeToggle: theme, langToggle: toggle }[id] || null; },
    querySelector(selector) { return selector === '.lang-panel' ? panel : selector === 'iframe.giscus-frame' ? frame : null; },
    querySelectorAll(selector) { return { '[data-lang-option]': options, '[data-i18n]': [heading], '[data-i18n-aria]': [sortGroup] }[selector] || []; },
    addEventListener() {}
};
const media = { matches: false, addEventListener(type, handler) { this.handler = handler; } };
const events = {};
const window = { matchMedia() { return media; }, addEventListener(type, handler) { events[type] = handler; }, dispatchEvent() {} };
const context = vm.createContext({ document, window, localStorage, console, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } } });
vm.runInContext(fs.readFileSync(path.join(root, 'interface-copy.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'site.js'), 'utf8').split('(function setupSoftPageNavigation()')[0], context);
vm.runInContext('setupInterfaceLocalization = () => () => {}; setupSiteControls({en:{sortLabel:"Sort content"}})', context);
const run = code => vm.runInContext(code, context);
options[2].handlers.click();
assert.equal(heading.textContent, 'Home');
assert.equal(sortGroup.attributes['aria-label'], 'Sort content');
assert.equal(document.documentElement.lang, 'en');
assert.equal(panel.hidden, true);
assert.equal(values.get('siteLang'), 'en');
assert.equal(messages.at(-1).message.giscus.setConfig.lang, 'en', 'Giscus must update even when its script is gone');
assert.equal(messages.at(-1).origin, 'https://giscus.app');
theme.handlers.click(); // auto -> light
media.matches = true;
media.handler();
assert.equal(document.documentElement.dataset.theme, 'light', 'System changes must not override an explicit theme');
theme.handlers.click(); // light -> dark
assert.equal(messages.at(-1).message.giscus.setConfig.theme, 'noborder_dark');
theme.handlers.click(); // dark -> auto
media.matches = false;
media.handler();
assert.equal(document.documentElement.dataset.theme, 'light');
values.set('siteLang', 'ja'); values.set('siteTheme', 'dark');
events.storage({ key: 'siteLang', storageArea: localStorage });
assert.equal(document.documentElement.lang, 'ja', 'Cross-tab changes must invalidate the in-memory preference');
assert.equal(document.documentElement.dataset.theme, 'dark');
values.clear();
events.storage({ key: null, storageArea: localStorage });
assert.equal(run('getStoredLang()'), 'zh-CN');
assert.equal(run('getStoredTheme()'), 'auto');
values.set('siteLang', 'invalid');
assert.equal(run('getStoredLang()'), 'zh-CN');
blocked = true;
options[2].handlers.click();
assert.equal(run('getStoredLang()'), 'en', 'Controls must remain usable without localStorage');
assert.equal(run('interfaceText("第 1 行第 2 列，已打开，周围 3 个雷", "en")'), 'Row 1, column 2, Revealed, 3 adjacent mines');
assert.equal(run('interfaceText("数据库归属地：移动 · 日本", "en")'), 'Database location: 移动 · 日本', 'Measured/provider payloads must not be translated');
assert.equal(run('interfaceText("console: 下载: command not found", "ja")'), 'console：下载：コマンドが見つかりません', 'Typed commands must be preserved');
for (const lang of ['zh-CN', 'zh-TW', 'en', 'ja']) {
    assert.equal(run(`interfaceText("123 ms", "${lang}")`), '123 ms');
    assert.equal(run(`interfaceText("https://example.com", "${lang}")`), 'https://example.com');
}
for (const page of ['index', 'home', 'blog', 'projects', 'nav', 'dashboard', 'games', 'terminal', 'ssh']) {
    const html = fs.readFileSync(path.join(root, `${page}.html`), 'utf8');
    assert.doesNotMatch(html, /href="site-themes\.css"/);
    assert.match(html, /src="interface-copy\.js"/);
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (!/\bsrc=/.test(match[1])) new vm.Script(match[2], { filename: `${page}.html` });
    }
}
const visa = fs.readFileSync(path.join(root, 'visa.html'), 'utf8');
assert.doesNotMatch(visa, /site-themes\.css|interface-copy\.js/);
const helperBuild = fs.readFileSync(path.join(root, 'tools/build-network-helper.py'), 'utf8');
assert.doesNotMatch(helperBuild, /files = \[[^\n]*"site-themes\.css"/);
assert.match(helperBuild, /files = \[[^\n]*"interface-copy\.js"/);
console.log('Passed: four locales, page ARIA, preference validation, storage fallback/sync, auto theme, giscus without script, payload preservation, and all inline script syntax.');
