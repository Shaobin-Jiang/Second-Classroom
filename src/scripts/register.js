const require = parent.window.require;

const { STUDENTINFOPATH, GetStudentInfo, RegisterActivity, generateActivityList, setProgressBar, clearActivities } = require('../second-classroom.js');
const fs = require('fs');

if (!fs.existsSync(STUDENTINFOPATH)) {
    alert('请先将学生信息进行登记!');
}
else {
    let studentInfo = GetStudentInfo();

    const hiddenUpload = document.querySelector('#hiddenUpload');
    hiddenUpload.onchange = function () {
        let finished = 0;
        let total = this.files.length;
        if (total !== 0) {
            document.querySelector('#console').clear();
        }
        for (let file of this.files) {
            out = RegisterActivity(file.path, studentInfo);
            document.querySelector('#console').addError(out.errors);
            document.querySelector('#console').addWarning(out.warnings);
            finished++;
            setProgressBar(finished / total);
        }
        this.value = '';
        setProgressBar(-1);
    }

    const hiddenUploadPatches = document.querySelector('#hiddenUploadPatches');
    hiddenUploadPatches.onchange = function () {
        let finished = 0;
        let total = this.files.length;
        if (total !== 0) {
            document.querySelector('#console').clear();
            let fullPath = this.files[0].path;
            let relativePath = this.files[0].webkitRelativePath.replace(/\//g, '\\');
            fullPath = fullPath.replace(relativePath, '');
            fullPath += relativePath.split('\\')[0];
            document.querySelector('#uploadPath p').innerHTML = `<span style="color: lightgreen;">已上传文件夹：${fullPath}</span>`;
        }
        for (let file of this.files) {
            out = RegisterActivity(file.path, studentInfo);
            document.querySelector('#console').addError(out.errors);
            document.querySelector('#console').addWarning(out.warnings);
            finished++;
            setProgressBar(finished / total);
        }
        // this.value = '';
        setProgressBar(-1);
    }

    document.querySelector('#uploadButton').onclick = function () {
        hiddenUpload.click();
    }

    document.querySelector('#uploadPath').onclick = function () {
        hiddenUploadPatches.click();
    }
}

document.querySelector('#clearActivities a').onclick = function () {
    let clear = confirm('是否要清除已经登记的活动信息？');
    if (clear) {
        clearActivities();
        document.querySelector('#uploadPath p').innerHTML = '上传文件夹';
    }
}

document.querySelector('#generateActivityList a').onclick = generateActivityList;
