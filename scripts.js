var themes = {
    "dark-alex": {
        "--color-primary": "#434",
        "--color-second": "#140f18",
        "--color-third": "#4a4a83",
        "--color-borders": "gray",

        "--color-font-primary": "#eee",
        "--color-font-second": "#54b4ec",
        "--color-font-third": "#eee",

        "--bg-image": 'url("./img/dashes.jpg")',
        "--bg-color": "#0000004d",
        "--bg-color-second": "#2b2035",
        "--bg-opaque": "#1a1818",

        "--border-style": "dashed",
        "--font-family": "Helvetica, sans-serif"
    },
    "sugar": {
        "--color-primary": "#434",
        "--color-second": "#5119598c",
        "--color-third": "#4a4a83",
        "--color-borders": "#66278a",

        "--color-font-primary": "#8e428d",
        "--color-font-second": "#54b4ec",
        "--color-font-third": "#eee",

        "--bg-image": 'url("./img/cakes.jpg")',
        "--bg-color": "rgba(240, 218, 247, 0.9)",
        "--bg-color-second": "#8743918c",
        "--bg-opaque": "#eadcf0",

        "--border-style": "double",
        "--font-family": "'Emilys Candy', cursive"
    }
}

// theme elements/semantic variables
{
    themes["dark-alex"]["--avatar-bg-color"] = themes["dark-alex"]["--color-second"];
    themes["sugar"]["--avatar-bg-color"] = "#cfa7d28c";

}

document.addEventListener("DOMContentLoaded", function (event) {

    var animBgCBox = document.getElementById('toggle-anim');
    var moreSugarCBox = document.getElementById('more-sugar');

    animBgCBox.checked = false;
    moreSugar(moreSugarCBox.checked);

    animBgCBox.onclick = toggleAnim;
    moreSugarCBox.onclick = moreSugar;
});


function toggleAnim(e) {
    var checked = e.target.checked;
    setCSSVar('--bg-animation', checked ? 'bgMove' : 'none');
}

function moreSugar(e) {
    const checked = typeof(e) !== "boolean" ? e.target.checked : e;

    const avatar = document.querySelector("#photo img");
    if(checked) {
        applyTheme(themes['sugar']);
        avatar.src = "img/carnico-repostero.gif";
        avatar.classList.add("repo");
    } else {
        applyTheme(themes['dark-alex']);
        avatar.src = "img/carnicov64.gif";
        avatar.classList.remove("repo");
    }
}

function applyTheme(vars) {
    var keys = Object.keys(vars);
    for(var i = 0; i < keys.length; i++) {
        setCSSVar(keys[i], vars[keys[i]]);
    }
}


function setCSSVar(varName, value) {
    document.documentElement.style.setProperty(varName, value);
}