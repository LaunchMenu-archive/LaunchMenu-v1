; test.ahk
;1=Autohotkeyc.exe
;2=C ; Console
;---------------
FileAppend Waiting for input...`n\>, *
FileReadLine line, CONIN$, 1
FileAppend You typed "%line%"`n, *
ExitApp