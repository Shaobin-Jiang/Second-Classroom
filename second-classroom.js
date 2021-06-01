/*
    Author: Jiang Shaobin (姜绍彬), Falculty of Psychology, Beijing Normal University
    Date: 
    Version: 1.0.0-beta
*/

/*
    About packing:
    The current program is packed using pkg (https://github.com/vercel/pkg)
    Recommended: manually download the base Node.js binaries from https://github.com/vercel/pkg-fetch/releases
    Copy the file to C:\Users\{username}\.pkg-cache\v{version} if the packaging is done on Windows
    Modify the downloaded filen name to 'fetched-v14.4.0-win-x64' (can be different depending on the pkg version)
    
    pkg -t win second-classroom.js
*/

const VERSION = '1.0.0-beta';

const fs = require('fs');
const process = require('process');
const pizzip = require('pizzip');
const docxtemplater = require('docxtemplater');
const path = require('path');
const xlsx = require('node-xlsx');
const progress = require('progress');

/*
    The desired action of the user:
    -i    Generating the student-info.json file
    -r    Registering an activity or multiple activities
    -v    Version info
    -z    Generating and zipping the eventual .docx files
*/
const ACTION = process.argv[2];
const STUDENTINFOPATH = path.resolve('core', 'student-info.json'); // Path to the student info json file
const TEMPLATEPATH = path.resolve('core', 'template.docx'); // Path to the template file
const ACTIVITYJSONPATH = path.resolve('core', 'activities'); // Path to the activity folder
const OUTPUTDIR = path.resolve('output');
if (!fs.existsSync(OUTPUTDIR)) {
    fs.mkdirSync(OUTPUTDIR);
}
if (!fs.existsSync(path.resolve('core', 'activities'))) {
    fs.mkdirSync(path.resolve('core', 'activities'));
}

switch (ACTION) {
    case '-e':
        var studentInfo = GetStudentInfo();
        if (typeof (studentInfo) !== 'undefined') {
            var dataObject = InitializeDataObject(); // Containing all the information of students and activities
            GenerateXlsxFiles();
        }
        break;
    case '-i':
        GenerateStudentInfo(process.argv[3]);
        break;
    case '-r':
        var studentInfo = GetStudentInfo();
        if (typeof (studentInfo) !== 'undefined') {
            if (fs.statSync(process.argv[3]).isDirectory()) {
                let fileList = fs.readdirSync(process.argv[3]);
                var parseActivityBar = new progress('Parsing activities: [:bar] :percent', { total: fileList.length, width: 100, complete: '=' });
                for (let file in fileList) {
                    if (fileList[file].indexOf('~$') !== 0) { // Check for any opened .xlsx files
                        RegisterActivity(path.resolve(process.argv[3], fileList[file]));
                    }
                    parseActivityBar.tick(1);
                }
            }
            else {
                RegisterActivity(process.argv[3]);
            }
        }
        break;
    case '-v':
        console.log('Second Classroom - version ' + VERSION);
        break;
    case '-w':
        var studentInfo = GetStudentInfo();
        if (typeof (studentInfo) !== 'undefined') {
            var dataObject = InitializeDataObject(); // Containing all the information of students and activities
            if (fs.existsSync(TEMPLATEPATH)) {
                var template = fs.readFileSync(TEMPLATEPATH, 'binary');
                var status = GenerateDocxFiles();
            }
            else {
                console.log('[Error] Template is missing!');
            }
        }
        break;
}

function GenerateStudentInfo(excelFilePath) {
    /*
        The excel file that contains student info should look like this:
        学号    姓名    班级    年级
        id1    name1   class1  grade1
        id2    name2   class2  grade2
        ...    ...     ...     ...
    */
    if (fs.existsSync(excelFilePath)) {
        let excelFileContent = xlsx.parse(excelFilePath)[0].data;
        var studentInfoObject = new Object();
        var bar = new progress('Generating student-info.json: [:bar] :percent', { total: excelFileContent.length, width: 100, complete: '=' });
        for (let i = 1; i < excelFileContent.length; i++) {
            // console.log(excelFileContent[i]);
            studentInfoObject[excelFileContent[i][0]] = {
                'name': excelFileContent[i][1],
                'class': excelFileContent[i][2],
                'grade': excelFileContent[i][3]
            }
            bar.tick(1);
        }
        fs.writeFileSync(STUDENTINFOPATH, JSON.stringify(studentInfoObject), 'utf-8');
        bar.tick(1);
    }
    else {
        console.log('[Error] Cannot find' + excelFilePath + '!');
    }
}

function RegisterActivity(excelFilePath) {
    /*
        Currently, this module only deals with social activities.
        Parameter excelFilePath can either be a single file or a folder that contains activity excel files only,
        The excel file should consist of two sheets: 主办方信息 and 参与者信息
        When an activity is registered, the program will automatically check for potential mistakes of mismatch between name and id.
        
        Sheet 主办方信息 should look like this:
            活动名称    活动时间    负责人姓名    负责人联系方式    主办方    应加分值
        
        Sheet 参与者信息 should look like this:
            参与者年级    参与者班级    参与者姓名    参与者学号    应加分值    备注
    */
    if (fs.existsSync(excelFilePath)) {
        let fileContent = xlsx.parse(excelFilePath);
        let host = fileContent[0].data[1];
        // Check whether the name of the activity awaiting registration is the same as an existing one
        if (fs.existsSync(path.resolve(ACTIVITYJSONPATH, host[0] + '.json'))) {
            console.log('[Warning] Activity \'' + host[0] + '\' has already been registered!');
            return;
        }
        let participant = fileContent[1].data;
        let makeFile = true;
        var activityObject = new Object();
        activityObject.meta = {
            '0': host[0],
            '1': '社会活动',
            '2': host[1],
            '3': host[2],
            '4': host[3]
        };
        activityObject.data = [];
        for (let i = 1; i < participant.length; i++) {
            let id = participant[i][3];
            // Use == instead of === here to avoid errors in such occasions as class being specified as numeric in excel and string here
            if ((id in studentInfo) && (studentInfo[id].name === participant[i][2]) && (studentInfo[id].class === participant[i][1]) && (studentInfo[id].grade === participant[i][0])) {
                activityObject.data.push({
                    '0': participant[i][2],
                    '1': id,
                    '2': participant[i][4],
                    '3': '1.0',
                    '4': (typeof (participant[i][5]) === 'undefined') ? '' : participant[i][5]
                })
            }
            else {
                makeFile = false;
                parseActivityBar.interrupt('[Error] File ' + excelFilePath + 'Cannot find student named ' + participant[i][2] + ', student id of ' + id + ', line' + (i + 1) + ' in the current student information page.');
            }
        }

        if (makeFile) {
            fs.writeFileSync(path.resolve(ACTIVITYJSONPATH, host[0] + '.json'), JSON.stringify(activityObject), 'utf-8');
        }
    }
    else {
        console.log('[Error] Cannot find' + excelFilePath + '!');
    }
}

function GetStudentInfo() {
    /*
        Read the .json file containing information of all the students and parse it into a JavaScript object.
        If the file does not exist, a warning will be displayed to the user.
    */
    if (fs.existsSync(STUDENTINFOPATH)) {
        return JSON.parse(fs.readFileSync(STUDENTINFOPATH, 'utf-8'));
    }
    else {
        console.log('[Error] Cannot find studentID.json in the core folder!');
        return undefined;
    }
}

function InitializeDataObject() {
    // Create an object containing the raw information of all students. Currently, activity and work information is not included.
    var dataObject = {};
    for (let key in studentInfo) {
        dataObject[key] = {};
        dataObject[key].id = key;
        dataObject[key].studentName = studentInfo[key].name;
        dataObject[key].grade = studentInfo[key].grade;
        dataObject[key].class = studentInfo[key].class;
        dataObject[key].workScore = 0;
        dataObject[key].work = [];
        dataObject[key].activityScore = 0;
        dataObject[key].activity = [];
        dataObject[key].totalScore = 0;
    }
    return dataObject;
}

function GenerateDocxFiles() {
    if (typeof (studentInfo) === 'undefined') {
        return false;
    }

    var activityFileList = fs.readdirSync(ACTIVITYJSONPATH);
    if (activityFileList.length === 0) {
        console.log('[Error] Folder \'Activities\' is currently empty!');
        return false;
    }
    console.log('[Second Classroom] Starting to generate docx files...');
    var activityBar = new progress('Parsing activities: [:bar] :percent', { total: activityFileList.length, width: 100, complete: '=' });
    for (let file in activityFileList) {
        ParseActivity(path.resolve(ACTIVITYJSONPATH, activityFileList[file]));
        activityBar.tick(1);
    }

    var bar = new progress('Generating docx files: [:bar] :percent', { total: Object.keys(dataObject).length, width: 100, complete: '=' });
    for (let key in dataObject) {
        if (dataObject[key].work.length > 3) {
            dataObject[key].work = BubbleSort(dataObject[key].work);
            dataObject[key].workScore = dataObject[key].work[0].workActualMark + dataObject[key].work[1].workActualMark + dataObject[key].work[2].workActualMark;
        }
        dataObject[key].activityScore = Math.min(150, dataObject[key].activityScore);
        dataObject[key].workScore = Math.min(150, dataObject[key].workScore);
        dataObject[key].totalScore = dataObject[key].activityScore * 1.4 + dataObject[key].workScore * 0.6;
        MakeDocxFile(dataObject[key], dataObject[key].grade + "级 " + dataObject[key].class + "班 " + key + " " + dataObject[key].studentName + ".docx");
        bar.tick(1);
    }
    console.log('[Second Classroom] Finished generating docx files.');
    return true;
}

function ParseActivity(filename) {
    /*
        Read a [activity].json file and parse its content.
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
        console.log('[Error] Cannot find' + filename + '!');
        return false;
    }
}

function MakeDocxFile(data, filepath) {
    // Make individual docx files
    let zip = new pizzip(template);
    let doc = new docxtemplater(zip);
    doc.setData(data);
    doc.render();
    let buffer = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(path.resolve(OUTPUTDIR, filepath), buffer);
}

function BubbleSort(arr) {
    var i = arr.length, j;
    var tempExchangVal;
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

function GenerateXlsxFiles() {
    console.log('[Second Classroom] Starting to generate xlsx files...');
    const dateStr = new Date();
    // Use the current year to calculate what grades xlsx files need to be generated for
    // For example, in [2020.9, 2021.9), xlsx files will be generated for grades 2017-2020 only
    const minGrade = (dateStr.getMonth() >= 9) ? dateStr.getFullYear() : (dateStr.getFullYear() - 1);
    const grades = [minGrade - 3, minGrade - 2, minGrade - 1, minGrade];

    var xlsxData = {};
    var maxEventNumber = {};
    for (let grade of grades) {
        xlsxData[grade] = [];
        maxEventNumber[grade] = 0;
    }

    for (let key in dataObject) {
        xlsxData[dataObject[key].grade].push(dataObject[key]);
        maxEventNumber[dataObject[key].grade] = Math.max(dataObject[key].activity.length, maxEventNumber[dataObject[key].grade]);
    }

    var excelBuilder = [];
    for (let grade of grades) {
        let data = Sort(xlsxData[grade]);
        let excelData = MakeXlsxFile(data, grade + '', maxEventNumber[grade]);
        excelBuilder.push(excelData);
    }
    var buffer = xlsx.build(excelBuilder);
    fs.writeFileSync(path.resolve(OUTPUTDIR, '实名社会公示.xlsx'), buffer, 'binary');
    console.log('[Second Classroom] Finished generating xlsx files.');

    function Sort(arr) {
        var i = arr.length, j;
        var tempExchangVal;
        while (i > 0) {
            for (j = 0; j < i - 1; j++) {
                if (arr[j].totalScore > arr[j + 1].totalScore) {
                    tempExchangVal = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = tempExchangVal;
                }
            }
            i--;
        }
        return arr.reverse();
    }
}

function MakeXlsxFile(data, grade, maxEventNumber) {
    var range = [{ s: { c: 8, r: 0 }, e: { c: 13, r: 0 } }, { s: { c: 14, r: 0 }, e: { c: 13 + maxEventNumber * 2, r: 0 } }];
    for (let n = 0; n < 8; n++) {
        range.push({ s: { c: n, r: 0 }, e: { c: n, r: 1 } });
    }
    var width = [{ wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 40 }, { wch: 10 }];
    for (let t = 0; t < maxEventNumber; t++) {
        width.push({ wch: 40 });
        width.push({ wch: 10 });
    }
    const option = { '!merges': range, '!cols': width };
    var dataSheet = [['学号', '姓名', '班级', '社会工作得分', '社会活动得分', '社会总分', '班级排名', '年级排名', '社会工作', null, null, null, null, null, '社会活动具体项目']];

    var secondRow = [null, null, null, null, null, null, null, null, '社会工作1', '得分', '社会工作2', '得分', '社会工作3', '得分'];
    for (let i = 0; i < maxEventNumber; i++) {
        secondRow.push('活动' + (i + 1));
        secondRow.push('得分');
    }
    dataSheet.push(secondRow);

    var totalRank = 1;
    var classRank = [0, 0, 0, 0, 0, 0, 0, 0]; // Guess that number of classes would not exceed 8. If it does, just push more 1s into this array.
    var totalRankLastScore = 0;
    var classRankLastScore = [0, 0, 0, 0, 0, 0, 0, 0];
    var classCount = [0, 0, 0, 0, 0, 0, 0, 0];
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