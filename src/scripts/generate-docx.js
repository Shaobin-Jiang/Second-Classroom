const require = parent.window.require;

const { STUDENTINFOPATH, GetStudentInfo, InitializeDataObject, GenerateDocxFiles } = require("../second-classroom.js");
const fs = require("fs");

if (!fs.existsSync(STUDENTINFOPATH)) {
    alert("请先将学生信息进行登记!");
}
else {
    document.querySelector("#generate").onclick = function() {
        GenerateDocxFiles(InitializeDataObject(GetStudentInfo()));
        this.onclick = "";
    }
}