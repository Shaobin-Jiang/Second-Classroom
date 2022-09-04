const require = parent.window.require;

const { STUDENTINFOPATH, GenerateStudentInfo, clearStudentInfo } = require('../second-classroom.js');
const fs = require('fs');

if (fs.existsSync(STUDENTINFOPATH)) {
    document.querySelector('#uploadPath p').innerHTML = '名单已上传';
}

const hiddenUpload = document.querySelector('#hiddenUpload');
hiddenUpload.onchange = function() {
    GenerateStudentInfo(this.files[0].path);
    document.querySelector('#uploadPath p').innerHTML = '名单已上传';
}

document.querySelector('#uploadButton').onclick = function() {
    hiddenUpload.click();
}

document.querySelector('#clearStudentInfo a').onclick = function () {
    let clear = confirm('是否要清除已经登记的学生信息？');
    if (clear) {
        clearStudentInfo();
        document.querySelector('#uploadPath p').innerHTML = '';
    }
}
