del core\activities\*.* /q
del core\student-info.json
del output\*.* /q
node second-classroom.js -v
node second-classroom.js -r test\activities
node second-classroom.js -w
node second-classroom.js -i test\student-info.xlsx
node second-classroom.js -w
node second-classroom.js -r test\activity1.xlsx
node second-classroom.js -r test\activity1.xlsx
node second-classroom.js -r test\activities
node second-classroom.js -w
node second-classroom.js -e
pause