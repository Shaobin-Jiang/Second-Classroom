const fs = require("fs");
const path = require("path");
const xlsx = require("node-xlsx");
const pizzip = require('pizzip');
const docxtemplater = require('docxtemplater');

const STUDENTINFOPATH = path.resolve(__dirname, "core", "student-info.json"); // Path to the student info json file
const TEMPLATEPATH = path.resolve(__dirname, "core", "template.docx"); // Path to the template file
const ACTIVITYJSONPATH = path.resolve(__dirname, "core", "activities"); // Path to the activity folder
const OUTPUTDIR = path.resolve(__dirname, "output");

function GenerateStudentInfo(excelFilePath) {
    /*
        The excel file that contains student info should look like this:
        学号    姓名    班级    年级
        id1    name1   class1  grade1
        id2    name2   class2  grade2
        ...    ...     ...     ...
    */
    let excelFileContent = xlsx.parse(excelFilePath)[0].data;
    let studentInfoObject = new Object();
    for (let i = 1; i < excelFileContent.length; i++) {
        studentInfoObject[excelFileContent[i][0]] = {
            "name": excelFileContent[i][1],
            "class": excelFileContent[i][2] * 1,
            "grade": excelFileContent[i][3] * 1
        }
    }
    fs.writeFileSync(STUDENTINFOPATH, JSON.stringify(studentInfoObject), "utf-8");
}

function RegisterActivity(excelFilePath, studentInfo) {
    /*
        Currently, this module only deals with social activities.
        Parameter excelFilePath is the path to a single file.
        The excel file should consist of two sheets: 主办方信息 and 参与者信息
        When an activity is registered, the program will automatically check for potential mistakes of mismatch between name and id.
        
        Sheet 主办方信息 should look like this:
            活动名称    活动时间    负责人姓名    负责人联系方式    主办方    应加分值
        
        Sheet 参与者信息 should look like this:
            参与者年级    参与者班级    参与者姓名    参与者学号    应加分值    备注
    */
    let e = 0; // Number of errors
    let w = 0; // Number of warnings
    if (fs.existsSync(excelFilePath)) {
        let fileContent = xlsx.parse(excelFilePath);
        let host = fileContent[0].data[1];
        host[0].replace(/\\|\/|:|\*|\?|"|<|>|\|/g, " ");
        // Check whether the name of the activity awaiting registration is the same as an existing one
        if (fs.existsSync(path.resolve(ACTIVITYJSONPATH, host[0] + ".json"))) {
            log(`[警告: <span style="font-weight: bold;">${excelFilePath}</span>] "${host[0]}" 已被注册!<br>    将使用${host[0]}(1).json作为活动名`, "blue");
            host[0] = `${host[0]}(1)`;
            w++;
        }
        let participant = fileContent[1].data;
        let makeFile = true;
        let activityObject = new Object();
        activityObject.meta = {
            "0": host[0],
            "1": "社会活动",
            "2": host[1],
            "3": host[2],
            "4": host[3]
        };
        activityObject.data = [];
        for (let i = 1; i < participant.length; i++) {
            if (participant[i].length === 0) {
                continue;
            }
            let id = participant[i][3];
            // Use == instead of === here to avoid errors in such occasions as class being specified as numeric in excel and string here
            if ((id in studentInfo) && (studentInfo[id].name == participant[i][2]) && (studentInfo[id].class == participant[i][1]) && (studentInfo[id].grade == participant[i][0])) {
                activityObject.data.push({
                    "0": participant[i][2],
                    "1": id,
                    "2": participant[i][4],
                    "3": "1.0",
                    "4": (typeof (participant[i][5]) === "undefined") ? "" : participant[i][5]
                })
            }
            else {
                e++;
                makeFile = false;
                let errMsg = `[错误: <span style="font-weight: bold;">${excelFilePath}</span>] 学生名单中找不到当前活动信息文件的第${(i + 1)}行中，名为<span style="color: white;">${participant[i][2]}</span>, 学号为${id}的学生`;
                let suggestion = [];
                if (id in studentInfo) {
                    suggestion.push([id, studentInfo[id]]);
                }
                for (let student in studentInfo) {
                    let info = studentInfo[student];
                    if (info.name === studentInfo[id].name && info != id) {
                        suggestion.push([student, info]);
                    }
                }
                if (info.length === 0) {
                    errMsg += "<br>&nbsp;&nbsp;&nbsp;&nbsp;学生名单中也找不到与其学号或姓名相同的学生。";
                }
                else {
                    errMsg += "<br>&nbsp;&nbsp;&nbsp;&nbsp;可能的修改建议：";
                    for (let info of suggestion) {
                        errMsg += `<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;学号: ${info[0]}\t姓名: ${info[1].name}\t班级: ${info[1].class}\t年级: ${info[1].grade}`;
                    }
                }
            }
        }

        if (makeFile) {
            fs.writeFileSync(path.resolve(ACTIVITYJSONPATH, host[0] + ".json"), JSON.stringify(activityObject), "utf-8");
            log(`Finished: ${excelFilePath}`, "green");
            return { success: true, errors: e, warnings: w };
        }
    }
    else {
        log(`[错误] 找不到文件 ${excelFilePath} + !`);
    }
    return { success: false, errors: e, warnings: w };
}

function GetStudentInfo() {
    /*
        Read the .json file containing information of all the students and parse it into a JavaScript object.
        If the file does not exist, a warning will be displayed to the user.
    */
    if (fs.existsSync(STUDENTINFOPATH)) {
        return JSON.parse(fs.readFileSync(STUDENTINFOPATH, "utf-8"));
    }
    else {
        return undefined;
    }
}

function InitializeDataObject(studentInfo) {
    // Create an object containing the raw information of all students. Currently, activity and work information is not included.
    let dataObject = {};
    for (let key in studentInfo) {
        dataObject[key] = {};
        dataObject[key].id = key;
        dataObject[key].studentName = studentInfo[key].name;
        let d = new Date();
        let grade = (d.getMonth() + 1 >= 9) ? d.getFullYear() - 1 : d.getFullYear();
        dataObject[key].grade = `${grade}-${grade + 1}`;
        dataObject[key].class = studentInfo[key].class;
        dataObject[key].workScore = 0;
        dataObject[key].work = [];
        dataObject[key].activityScore = 0;
        dataObject[key].activity = [];
        dataObject[key].totalScore = 0;
    }
    return dataObject;
}

function ParseActivity(filename, dataObject) {
    /*
        Read an [activity].json file and parse its content.
        Returns true if parsing succeeds and false if it fails.
        An individual [activity].json file should look like:
        {
            "meta": {
                "0": name,
                "1": type (社会活动 / 社会工作)
                "2": time
                "3": reference
                "4": telephone
            },
            data": {
                [
                    {
                        "0": name1
                        "1": id1
                        "2": score1
                        "3": coefficient1 (set to 1.0 if this is social activity)
                        "4": remark1
                    },
                    {
                        "0": name2
                        "1": id2
                        "2": score2
                        "3": coefficient2 (set to 1.0 if this is social activity)
                        "4": remark2
                    }
                ]
            }
        }
    */
    if (fs.existsSync(filename)) {
        let activityObject = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        let meta = activityObject.meta;
        let data = activityObject.data;
        if (meta[1] === '社会活动') {
            for (let individual in data) {
                let studentId = data[individual][1];

                // Add the activity to the dataObject regardless whether the total score of an individual student exceeds the upperlimit
                // Will deal with that in following processes
                dataObject[studentId].activityScore += data[individual][2] * 1;
                dataObject[studentId].activity.push({
                    activityName: meta[0] + data[individual][4],
                    activityTime: meta[2],
                    activityReference: meta[3],
                    activityTelephone: meta[4],
                    activityMark: data[individual][2],
                    activityActualMark: data[individual][2]
                });
            }
        }
        else {
            for (let individual in data) {
                let studentId = data[individual][1];

                dataObject[studentId].workScore += parseFloat(data[individual][2]) * parseFloat(data[individual][3]);
                dataObject[studentId].work.push({
                    workName: meta[0],
                    workTime: meta[2],
                    workReference: meta[3],
                    workTelephone: meta[4],
                    workMark: data[individual][2],
                    workCoefficient: data[individual][3],
                    workActualMark: parseFloat(data[individual][2]) * parseFloat(data[individual][3])
                })
            }
        }
        return true;
    }
    else {
        log(`[错误] 找不到文件 ${filename} + !`);
        return false;
    }
}

function GenerateDocxFiles(dataObject) {
    if (!fs.existsSync(TEMPLATEPATH)) {
        log("[错误] 找不到template.docx文件!", "red");
        return false;
    }
    let activityFileList = fs.readdirSync(ACTIVITYJSONPATH);
    if (activityFileList.length === 0) {
        log("[错误]Activities文件夹为空!", "red");
        return false;
    }
    log('[第二课堂] 开始生成docx文件...', "green");
    let c = document.querySelector("iframe").contentDocument.querySelector("#console");
    for (let file in activityFileList) {
        success = ParseActivity(path.resolve(ACTIVITYJSONPATH, activityFileList[file]), dataObject);
        if (!success) {
            c.addError(1);
        }
    }

    for (let key in dataObject) {
        if (dataObject[key].work.length > 3) {
            dataObject[key].work = BubbleSort(dataObject[key].work);
            dataObject[key].workScore = dataObject[key].work[0].workActualMark + dataObject[key].work[1].workActualMark + dataObject[key].work[2].workActualMark;
        }
        dataObject[key].activityScore = Math.min(150, dataObject[key].activityScore);
        dataObject[key].workScore = Math.min(150, dataObject[key].workScore);
        dataObject[key].totalScore = dataObject[key].activityScore * 0.6 + dataObject[key].workScore * 1.4;
        MakeDocxFile(dataObject[key], dataObject[key].grade + "级 " + dataObject[key].class + "班 " + key + " " + dataObject[key].studentName + ".docx");
    }
    log("[第二课堂] 生成完成!", "green");
    return true;
}

function MakeDocxFile(data, filepath) {
    // Make individual docx files
    let zip = new pizzip(fs.readFileSync(TEMPLATEPATH, 'binary'));
    let doc = new docxtemplater(zip);
    doc.setData(data);
    doc.render();
    let buffer = doc.getZip().generate({ type: 'nodebuffer' });
    let targetDir = data.grade + "-" + data.class;
    if (!fs.existsSync(path.resolve(OUTPUTDIR, targetDir))) {
        fs.mkdirSync(path.resolve(OUTPUTDIR, targetDir));
    }
    fs.writeFileSync(path.resolve(OUTPUTDIR, targetDir, filepath), buffer);
}

function BubbleSort(arr) {
    let i = arr.length, j;
    let tempExchangVal;
    while (i > 0) {
        for (j = 0; j < i - 1; j++) {
            if (arr[j].workActualMark > arr[j + 1].workActualMark) {
                tempExchangVal = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tempExchangVal;
            }
        }
        i--;
    }
    return arr.reverse().slice(0, 3);
}

function GetMinGrade() {
    let dateStr = new Date();
    // Use the current year to calculate what grades xlsx files need to be generated for
    // For example, in [2020.9, 2021.9), xlsx files will be generated for grades 2017-2020 only
    return (dateStr.getMonth() + 1 >= 9) ? dateStr.getFullYear() : (dateStr.getFullYear() - 1);
}

function GenerateXlsxFiles(dataObject) {
    let activityFileList = fs.readdirSync(ACTIVITYJSONPATH);
    if (activityFileList.length === 0) {
        log("[错误] Activities文件夹为空!", "red");
        return false;
    }
    log("[第二课堂] 开始生成xlsx文件...", "green");
    for (let file in activityFileList) {
        ParseActivity(path.resolve(ACTIVITYJSONPATH, activityFileList[file]), dataObject);
    }
    
    const minGrade = GetMinGrade()
    const grades = [minGrade - 3, minGrade - 2, minGrade - 1, minGrade];

    let xlsxData = {};
    let maxEventNumber = {};
    for (let grade of grades) {
        xlsxData[grade] = [];
        maxEventNumber[grade] = 0;
    }

    for (let key in dataObject) {
        if (dataObject[key].grade * 1 >= minGrade - 3 && dataObject[key].grade * 1 <= minGrade) {
            dataObject[key].activityScore = Math.min(dataObject[key].activityScore, 150);
            xlsxData[dataObject[key].grade].push(dataObject[key]);
            maxEventNumber[dataObject[key].grade] = Math.max(dataObject[key].activity.length, maxEventNumber[dataObject[key].grade]);
        }
    }

    let excelBuilder = [];
    for (let grade of grades) {
        // Calculate the total score for each person and then sort it
        let data = xlsxData[grade];
        for (let j = 0; j < data.length; j++) {
            data[j].totalScore = data[j].workScore * 1 + data[j].activityScore * 1;
        }
        data = Sort(xlsxData[grade]);
        let excelData = MakeXlsxFile(data, grade + '', maxEventNumber[grade]);
        excelBuilder.push(excelData);
    }
    let buffer = xlsx.build(excelBuilder);
    fs.writeFileSync(path.resolve(OUTPUTDIR, '实名社会公示.xlsx'), buffer, 'binary');
    log("[第二课堂] 生成完成!", "green");

    function Sort(arr) {
        let tempExchangVal;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i].totalScore < arr[j].totalScore) {
                    tempExchangVal = arr[i];
                    arr[i] = arr[j];
                    arr[j] = tempExchangVal;
                }
            }
        }
        return arr;
    }
}

function MakeXlsxFile(data, grade, maxEventNumber) {
    let range = [{ s: { c: 8, r: 0 }, e: { c: 13, r: 0 } }, { s: { c: 14, r: 0 }, e: { c: 13 + Math.max(maxEventNumber * 2, 1), r: 0 } }];
    for (let n = 0; n < 8; n++) {
        range.push({ s: { c: n, r: 0 }, e: { c: n, r: 1 } });
    }
    let width = [{ wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 40 }, { wch: 10 }];
    for (let t = 0; t < maxEventNumber; t++) {
        width.push({ wch: 40 });
        width.push({ wch: 10 });
    }
    const option = { '!merges': range, '!cols': width };
    let dataSheet = [['学号', '姓名', '班级', '社会工作得分', '社会活动得分', '社会总分', '班级排名', '年级排名', '社会工作', null, null, null, null, null, '社会活动具体项目']];

    let secondRow = [null, null, null, null, null, null, null, null, '社会工作1', '得分', '社会工作2', '得分', '社会工作3', '得分'];
    for (let i = 0; i < maxEventNumber; i++) {
        secondRow.push('活动' + (i + 1));
        secondRow.push('得分');
    }
    dataSheet.push(secondRow);

    let totalRank = 1;
    let classRank = [0, 0, 0, 0, 0, 0, 0, 0]; // Guess that number of classes would not exceed 8. If it does, just push more 1s into this array.
    let totalRankLastScore = 0;
    let classRankLastScore = [0, 0, 0, 0, 0, 0, 0, 0];
    let classCount = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let j = 0; j < data.length; j++) {
        let classIndex = data[j].class - 1;
        classCount[classIndex] += 1;
        if (data[j].totalScore != totalRankLastScore) {
            totalRank = j + 1;
            totalRankLastScore = data[j].totalScore;
        }
        if (data[j].totalScore != classRankLastScore[classIndex]) {
            classRank[classIndex] = classCount[classIndex];
            classRankLastScore[classIndex] = data[j].totalScore;
        }
        let row = [data[j].id, data[j].studentName, data[j].class, data[j].workScore, data[j].activityScore, data[j].totalScore, classRank[classIndex], totalRank];
        for (let p = 0; p < 3; p++) {
            if (typeof (data[j].work[p]) === 'undefined') {
                row.push(null);
                row.push(null);
            }
            else {
                row.push(data[j].work[p].workName);
                row.push(data[j].work[p].workActualMark);
            }
        }
        for (let q = 0; q < maxEventNumber; q++) {
            if (typeof (data[j].activity[q]) === 'undefined') {
                row.push(null);
                row.push(null);
            }
            else {
                row.push(data[j].activity[q].activityName);
                row.push(data[j].activity[q].activityActualMark);
            }
        }
        dataSheet.push(row);
    }
    return { 'name': grade, 'data': dataSheet, 'options': option };
}

function log(msg, color) {
    document.querySelector("iframe").contentDocument.querySelector("#console").log(`<p style="color: ${typeof color === "undefined" ? "white" : color};"><span style="color: white;">&gt;&gt;&gt; </span>${msg}</p>`);
}

module.exports = {
    STUDENTINFOPATH,
    GetStudentInfo,
    GenerateStudentInfo,
    RegisterActivity,
    InitializeDataObject,
    GenerateDocxFiles,
    GenerateXlsxFiles
}