const sessionSettings = {};
const siteLocales = {
    "zh-CN": {
        home: "首页",
        profile: "个人页",
        blog: "博客",
        projects: "我的作品",
        visa: "签证信息",
        games: "小游戏",
        siteNav: "网站导航",
        dashboard: "状态面板",
        language: "语言",
        themeAuto: "自动",
        themeLight: "日间",
        themeDark: "夜间",
        themeLabel: "主题",
        categories: {
            "全部": "全部",
            "技术": "技术",
            "AI": "AI",
            "视频": "视频",
            "生活": "生活"
        }
    },
    "zh-TW": {
        home: "首頁",
        profile: "個人頁",
        blog: "部落格",
        projects: "我的作品",
        visa: "簽證資訊",
        games: "小遊戲",
        siteNav: "網站導航",
        dashboard: "狀態面板",
        language: "語言",
        themeAuto: "自動",
        themeLight: "日間",
        themeDark: "夜間",
        themeLabel: "主題",
        categories: {
            "全部": "全部",
            "技术": "技術",
            "AI": "AI",
            "视频": "影片",
            "生活": "生活"
        }
    },
    en: {
        home: "Home",
        profile: "Profile",
        blog: "Blog",
        projects: "My Work",
        visa: "Visa Info",
        games: "Games",
        siteNav: "Links",
        dashboard: "Status",
        language: "Language",
        themeAuto: "Auto",
        themeLight: "Light",
        themeDark: "Dark",
        themeLabel: "Theme",
        categories: {
            "全部": "All",
            "技术": "Tech",
            "AI": "AI",
            "视频": "Videos",
            "生活": "Life"
        }
    },
    ja: {
        home: "ホーム",
        profile: "プロフィール",
        blog: "ブログ",
        projects: "作品",
        visa: "ビザ情報",
        games: "ゲーム",
        siteNav: "リンク集",
        dashboard: "ステータス",
        language: "言語",
        themeAuto: "自動",
        themeLight: "ライト",
        themeDark: "ダーク",
        themeLabel: "テーマ",
        categories: {
            "全部": "すべて",
            "技术": "技術",
            "AI": "AI",
            "视频": "動画",
            "生活": "生活"
        }
    }
};

function getStoredLang() {
    let lang;
    try {
        lang = sessionSettings.siteLang || localStorage.getItem("siteLang");
    } catch {
        lang = sessionSettings.siteLang;
    }
    return Object.hasOwn(siteLocales, lang) ? lang : "zh-CN";
}

function getStoredTheme() {
    try {
        const mode = sessionSettings.siteTheme || localStorage.getItem("siteTheme");
        return mode === "light" || mode === "dark" ? mode : "auto";
    } catch {
        return sessionSettings.siteTheme || "auto";
    }
}

function storeSiteSetting(key, value) {
    sessionSettings[key] = value;
    try {
        localStorage.setItem(key, value);
    } catch {
        // Keep the control usable for this page when storage is unavailable.
    }
}

function getResolvedTheme(mode = getStoredTheme()) {
    if (mode !== "auto") return mode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode = getStoredTheme()) {
    const resolvedTheme = getResolvedTheme(mode);
    document.documentElement.dataset.theme = resolvedTheme;
    const button = document.getElementById("themeToggle");
    if (button) {
        const locale = siteLocales[getStoredLang()] || siteLocales["zh-CN"];
        if (button.dataset.iconUi === "remix") {
            const icon = mode === "auto" ? "ri-contrast-2-line" : mode === "dark" ? "ri-moon-line" : "ri-sun-line";
            button.innerHTML = `<i class="${icon}" aria-hidden="true"></i>`;
        } else {
            button.textContent = mode === "auto" ? "◐" : mode === "dark" ? "☾" : "☀";
        }
        const modeLabel = mode === "auto" ? locale.themeAuto : mode === "dark" ? locale.themeDark : locale.themeLight;
        button.setAttribute("aria-label", `${locale.themeLabel}: ${modeLabel}`);
        button.title = `${locale.themeLabel}: ${modeLabel}`;
    }
    if (typeof siteInterfaceCopy !== "undefined") {
        syncSiteComments();
        window.dispatchEvent(new CustomEvent("site-theme-change", { detail: { theme: resolvedTheme, mode } }));
    }
}

// https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md
function syncSiteComments() {
    const script = document.getElementById("siteComments");
    const frame = document.querySelector("iframe.giscus-frame");
    // The client removes its script after creating the iframe.
    if (!script && !frame) return;
    const config = {
        lang: getStoredLang(),
        theme: getResolvedTheme() === "dark" ? "noborder_dark" : "noborder_light"
    };
    if (script) {
        script.dataset.lang = config.lang;
        script.dataset.theme = config.theme;
    }
    if (frame) frame.contentWindow.postMessage({ giscus: { setConfig: config } }, "https://giscus.app");
}

function applyLanguage(pageLocales = {}, onChange) {
    const lang = getStoredLang();
    const locale = { ...siteLocales["zh-CN"], ...(siteLocales[lang] || {}) };
    const pageLocale = pageLocales[lang] || pageLocales["zh-CN"] || {};

    // Visa keeps its original localization contract; the other pages load UI copy.
    document.documentElement.lang = typeof siteInterfaceCopy !== "undefined" ? lang : "zh-CN";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
        const key = node.dataset.i18n;
        node.textContent = pageLocale[key] || locale[key] || key;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
        const key = node.dataset.i18nPlaceholder;
        node.placeholder = pageLocale[key] || key;
    });

    document.querySelectorAll("[data-lang-option]").forEach((button) => {
        button.classList.toggle("active", button.dataset.langOption === lang);
        button.setAttribute("aria-pressed", String(button.dataset.langOption === lang));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
        const key = node.dataset.i18nAria;
        node.setAttribute("aria-label", pageLocale[key] || locale[key] || node.textContent.trim());
    });
    const langToggle = document.getElementById("langToggle");
    if (langToggle) langToggle.setAttribute("aria-label", locale.language);
    applyTheme();
    if (onChange) onChange(lang);
}

function setupSiteControls(pageLocales = {}, onChange) {
    const refreshInterface = typeof setupInterfaceLocalization === "function" ? setupInterfaceLocalization() : null;
    const refreshLanguage = () => {
        applyLanguage(pageLocales, onChange);
        refreshInterface?.();
    };
    const themeToggle = document.getElementById("themeToggle");
    const langToggle = document.getElementById("langToggle");
    const langPanel = document.querySelector(".lang-panel");

    function closeLanguageMenu(restoreFocus = false) {
        if (!langToggle || !langPanel) return;
        langPanel.hidden = true;
        langToggle.setAttribute("aria-expanded", "false");
        if (restoreFocus) langToggle.focus();
    }

    if (langToggle && langPanel) {
        langPanel.hidden = true;
        langToggle.setAttribute("aria-expanded", "false");
        langToggle.addEventListener("click", () => {
            const willOpen = langPanel.hidden;
            langPanel.hidden = !willOpen;
            langToggle.setAttribute("aria-expanded", String(willOpen));
            if (willOpen) langPanel.querySelector("[aria-pressed='true']")?.focus();
        });
        langToggle.closest(".lang-menu").addEventListener("focusout", (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) closeLanguageMenu();
        });
        document.addEventListener("pointerdown", (event) => {
            if (!event.target.closest(".lang-menu")) closeLanguageMenu();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !langPanel.hidden) {
                event.preventDefault();
                closeLanguageMenu(true);
            }
        });
    }

    document.querySelectorAll("[data-lang-option]").forEach((button) => {
        button.addEventListener("click", () => {
            storeSiteSetting("siteLang", button.dataset.langOption);
            refreshLanguage();
            closeLanguageMenu(true);
        });
    });

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current = getStoredTheme();
            const next = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
            storeSiteSetting("siteTheme", next);
            applyTheme(next);
        });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (getStoredTheme() === "auto") applyTheme("auto");
    });

    if (refreshInterface) {
        window.addEventListener("storage", (event) => {
            if (event.storageArea !== localStorage || (event.key !== null && !["siteLang", "siteTheme"].includes(event.key))) return;
            delete sessionSettings.siteLang;
            delete sessionSettings.siteTheme;
            refreshLanguage();
        });
        // Giscus may finish loading after the user changes either setting.
        document.addEventListener("load", (event) => {
            if (event.target.matches?.("iframe.giscus-frame")) syncSiteComments();
        }, true);
    }
    refreshLanguage();
}

function categoryLabel(category, lang = getStoredLang()) {
    const locale = siteLocales[lang] || siteLocales["zh-CN"];
    return locale.categories[category] || category;
}

(function setupSoftPageNavigation() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsNativeTransition = typeof document.startViewTransition === "function"
        && CSS.supports("view-transition-name: root");

    if (reducedMotion || supportsNativeTransition) return;

    document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");
        if (!link || event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

        const destination = new URL(link.href, window.location.href);
        const isLocalPage = destination.origin === window.location.origin
            && /\.html$/i.test(destination.pathname);

        if (!isLocalPage || destination.href === window.location.href) return;

        event.preventDefault();
        document.documentElement.classList.add("page-is-leaving");
        window.setTimeout(() => window.location.assign(destination.href), 180);
    });

    window.addEventListener("pageshow", () => {
        document.documentElement.classList.remove("page-is-leaving");
    });
})();
