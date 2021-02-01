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

document.addEventListener("DOMContentLoaded", function (event) {

    var animBgCBox = document.getElementById('stop-anim');
    var moreSugarCBox = document.getElementById('more-sugar');

    animBgCBox.checked = false;

    animBgCBox.onclick = stopAnim;
    moreSugarCBox.onclick = moreSugar;
});


function stopAnim(e) {
    var checked = e.target.checked;
    setCSSVar('--bg-animation', checked ? 'bgMove' : 'none');
}

function moreSugar(e) {
    
    if ( e.target.checked ) {
        applyTheme(themes['sugar']);
    } else {
        applyTheme(themes['dark-alex']);
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