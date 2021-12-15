const ipc = require('electron').ipcRenderer;

// Toggle dev tools
document.onkeydown = function(e) {
    switch (e.key) {
        case "F12": ipc.send("dev-tools"); break;
        case "F5": document.querySelector("iframe").contentWindow.document.location.reload(true); break;
        case "r": if (e.ctrlKey) {
            parent.document.location.reload(true);
        }
    }
}

for (let option of document.querySelectorAll(".option")) {
    option.onclick = function() {
        document.querySelector("iframe").style.display = "block";
    }
}

// Fake icons
document.querySelector("#minimize").onclick = function() {
    ipc.send("minimize");
}
document.querySelector("#close").onclick = function() {
    ipc.send("close");
}

// Highlight
var currentOption;
function highlight(el) {
    if (typeof currentOption !== "undefined") {
        currentOption.className = currentOption.className.replace(" highlight", "");
    }
    el.className += " highlight";
    currentOption = el;
}