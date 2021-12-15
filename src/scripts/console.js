(function() {
    let c = document.createElement("div");
    c.id = "console";
    c.innerHTML = `
    <div id="header"><div id="title"><p>日志: <span id="error">0</span> error, <span id="warning">0</span> warning</span></p></div><div id="save"><p>保存日志</p></div><div id="consoleClose"><p>&times</p></div></div>
    <div id="outputArea"></div>
    `;
    document.body.appendChild(c);

    c.errors = 0;
    c.warnings = 0;

    c.log = function(content) {
        document.querySelector("#outputArea").innerHTML += content;
    }

    c.addError = function(e) {
        c.errors += e;
        document.querySelector("#error").innerHTML = c.errors;
    }

    c.addWarning = function(w) {
        c.warnings += w;
        document.querySelector("#warning").innerHTML = c.warnings;
    }

    c.folded = true;
    document.querySelector("#consoleClose").onclick = function() {
        c.style.bottom = "-260px";
        c.folded = true;
        this.style.display = "none";
    }
    document.querySelector("#title").onclick = function() {
        if (c.folded) {
            c.style.bottom = "0px";
            document.querySelector("#consoleClose").style.display = "block";
        }
        else {
            c.style.bottom = "-260px";
            document.querySelector("#consoleClose").style.display = "none";
        }
        c.folded = !c.folded;
    }

    document.querySelector("#save").onclick = function() {
        let content = document.querySelector("#outputArea").innerHTML;
        let d = new Date();
        let fileName = `${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}.txt`;
        parent.window.require("fs").writeFileSync(parent.window.require("path").resolve("log", fileName), content, "utf-8");
    }
})();