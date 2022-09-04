(function() {
    let windowId = window.parent.document.querySelector('#headBar .option.highlight p').innerHTML[0];
    windowId = Number(windowId) - 1;

    let c = document.createElement("div");
    c.id = "console";
    c.innerHTML = `
    <div id="header"><div id="title"><p>日志: <span id="error">0</span> error, <span id="warning">0</span> warning</span></p></div><div id="save"><p>保存日志</p></div><div id="clearConsole"><p>清空输出</p></div><div id="consoleClose"><p>&times</p></div></div>
    <div id="outputArea"></div>
    `;
    document.body.appendChild(c);

    c.errors = 0;
    c.warnings = 0;

    function update() {
        let content = {
            innerHTML: c.querySelector('#outputArea').innerHTML,
            errors: c.errors,
            warnings: c.warnings
        };
        window.parent.consoleContent[windowId] = content;
    }

    function restore() {
        if (Object.keys(window.parent.consoleContent[windowId]).length !== 0) {
            let content = window.parent.consoleContent[windowId];
            console.log(content)
            c.querySelector('#outputArea').innerHTML = content.innerHTML;
            c.errors = content.errors;
            c.warnings = content.warnings;
            c.querySelector('#error').innerHTML = c.errors;
            c.querySelector('#warning').innerHTML = c.warnings;
        }
    }
    restore();

    c.log = function(content) {
        c.querySelector("#outputArea").innerHTML += content;
        update();
    }

    c.addError = function(e) {
        c.errors += e;
        c.querySelector("#error").innerHTML = c.errors;
        update();
    }

    c.addWarning = function(w) {
        c.warnings += w;
        c.querySelector("#warning").innerHTML = c.warnings;
        update();
    }

    c.clear = function () {
        c.errors = 0;
        c.warnings = 0;
        c.querySelector('#error').innerHTML = c.errors;
        c.querySelector('#warning').innerHTML = c.warnings;
        c.querySelector("#outputArea").innerHTML = '';
        update();
    }

    c.folded = true;
    c.querySelector('#clearConsole').onclick = c.clear;
    c.querySelector("#consoleClose").onclick = function() {
        c.style.bottom = "-400px";
        c.folded = true;
        this.style.display = "none";
    }
    c.querySelector("#title").onclick = function() {
        if (c.folded) {
            c.style.bottom = "0px";
            c.querySelector("#consoleClose").style.display = "block";
        }
        else {
            c.style.bottom = "-400px";
            c.querySelector("#consoleClose").style.display = "none";
        }
        c.folded = !c.folded;
    }

    c.querySelector("#save").onclick = function() {
        let content = c.querySelector("#outputArea").innerHTML;
        let d = new Date();
        let fileName = `${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}.txt`;
        parent.window.require("fs").writeFileSync(parent.window.require("path").resolve("log", fileName), content, "utf-8");
    }
})();
