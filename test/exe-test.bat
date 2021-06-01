del core\activities\*.* /q
del core\student-info.json
del output\*.* /q
second-classroom.exe -v
second-classroom.exe -r test\activities
second-classroom.exe -w
second-classroom.exe -i test\student-info.xlsx
second-classroom.exe -w
second-classroom.exe -r test\activity1.xlsx
second-classroom.exe -r test\activity1.xlsx
second-classroom.exe -r test\activities
second-classroom.exe -w
second-classroom.exe -e
pause