const siteLocales = {
    "zh-CN": {
        home: "首页",
        profile: "个人页",
        blog: "博客",
        games: "小游戏",
        siteNav: "网站导航",
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
        games: "小遊戲",
        siteNav: "網站導航",
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
        games: "Games",
        siteNav: "Links",
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
        games: "ゲーム",
        siteNav: "リンク集",
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
    return localStorage.getItem("siteLang") || "zh-CN";
}

function getStoredTheme() {
    return localStorage.getItem("siteTheme") || "auto";
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
        button.textContent = resolvedTheme === "dark" ? "☾" : "☀";
        button.setAttribute("aria-label", `${locale.themeLabel}: ${resolvedTheme === "dark" ? locale.themeDark : locale.themeLight}`);
    }
}

function applyLanguage(pageLocales = {}, onChange) {
    const lang = getStoredLang();
    const locale = { ...siteLocales["zh-CN"], ...(siteLocales[lang] || {}) };
    const pageLocale = pageLocales[lang] || pageLocales["zh-CN"] || {};

    document.documentElement.lang = lang;
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
    });
    applyTheme();
    if (onChange) onChange(lang);
}

function setupSiteControls(pageLocales = {}, onChange) {
    const themeToggle = document.getElementById("themeToggle");

    document.querySelectorAll("[data-lang-option]").forEach((button) => {
        button.addEventListener("click", () => {
            localStorage.setItem("siteLang", button.dataset.langOption);
            applyLanguage(pageLocales, onChange);
        });
    });

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const next = getResolvedTheme() === "dark" ? "light" : "dark";
            localStorage.setItem("siteTheme", next);
            applyTheme(next);
        });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (getStoredTheme() === "auto") applyTheme("auto");
    });

    applyLanguage(pageLocales, onChange);
}

function categoryLabel(category, lang = getStoredLang()) {
    const locale = siteLocales[lang] || siteLocales["zh-CN"];
    return locale.categories[category] || category;
}
