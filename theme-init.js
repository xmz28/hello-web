(function () {
    let mode = "auto";
    try {
        mode = localStorage.getItem("siteTheme") || "auto";
    } catch {
        // Storage may be disabled; use the system preference.
    }
    if (mode !== "light" && mode !== "dark") mode = "auto";
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = mode === "auto" ? (isDark ? "dark" : "light") : mode;
})();
