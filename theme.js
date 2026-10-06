newFunction();

function newFunction() {
    try { var th = localStorage.getItem("dc_theme") || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"); document.documentElement.setAttribute("data-theme", th); } catch (e) { }
}
