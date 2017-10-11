FileSelectFolder,FilePath
FileList=
Loop, %FilePath%\*,1,1
{
    FileType:= FileExist(A_LoopFileFullPath)=="D" ? "\\" : ""
    FilePath:= StrReplace(A_LoopFileFullPath,"\","\\")
    FileList = %FileList%,"%FilePath%%FileType%"
}
Filelist := "var Files = [" . SubStr(FileList,2) . "]"
FileDelete, %A_WorkingDir%\File.js
FileAppend, 
Msgbox, %FileList%


/*
D|C:\Users\sancarn\Desktop\LaunchBar AHK\Backups
F|C:\Users\sancarn\Desktop\LaunchBar AHK\DirectoryList.ahk
D|C:\Users\sancarn\Desktop\LaunchBar AHK\Future
F|C:\Users\sancarn\Desktop\LaunchBar AHK\LaunchBar.ahk
F|C:\Users\sancarn\Desktop\LaunchBar AHK\LaunchBar.exe
F|C:\Users\sancarn\Desktop\LaunchBar AHK\Launchbar_Menu.html
D|C:\Users\sancarn\Desktop\LaunchBar AHK\WebAppTest1
F|C:\Users\sancarn\Desktop\LaunchBar AHK\Backups\Launchbar_Menu.html
F|C:\Users\sancarn\Desktop\LaunchBar AHK\Future\LaunchBar_$MainControl.html
F|C:\Users\sancarn\Desktop\LaunchBar AHK\WebAppTest1\CWebView.ahk
F|C:\Users\sancarn\Desktop\LaunchBar AHK\WebAppTest1\Test1.ahk
*/


