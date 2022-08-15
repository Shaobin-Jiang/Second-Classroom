const require = parent.window.require;

const { STUDENTINFOPATH, GetStudentInfo, RegisterActivity, setProgressBar } = require("../second-classroom.js");
const fs = require("fs");

if (!fs.existsSync(STUDENTINFOPATH)) {
    alert("请先将学生信息进行登记!");
}
else {
    let studentInfo = GetStudentInfo();
    const hiddenUpload = document.querySelector("#hiddenUpload");
    hiddenUpload.onchange = function () {
        let finished = 0;
        let total = this.files.length;
        for (let file of this.files) {
            out = RegisterActivity(file.path, studentInfo);
            document.querySelector("#console").addError(out.errors);
            document.querySelector("#console").addWarning(out.warnings);
            finished++;
            setProgressBar(finished / total);
        }
        setProgressBar(-1);
    }

    document.querySelector("#uploadButton").onclick = function () {
        hiddenUpload.click();
    }
}