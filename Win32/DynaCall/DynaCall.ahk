;How to execute AHK as console application:
;http://autohotkey.com/board/topic/52576-ahk-l-output-to-command-line/?p=372590
;#############################################################

;Get all parameters
p := GetParamArray()

if p.length() = 0 {
	FileAppend Error: Too few parameters., *
	ExitApp
}

;Example:
;DynaCall "MessageBox" "Int" "0" "Str" "Press Yes or No" "Str" "Title of box" "Int" "4"

try {
	ret := DllCall(p*)
}

s=
loop, % (p.length()-1)/2
{
	idx := A_Index * 2
	args .= ",{arg: """ . p[idx+1] . """, type: """ . p[idx] . """}"
}
args := Substr(args, 2)
sRet := "{out: """ . ret . """,in:{ function: """ . p[1] . """, args: [" . args . "]}}`n" 

;Print arguments to console
returnArgs := strJoin([p*],""",""")
FileAppend %sRet%, *

ExitApp

;Returns JSON format:
;{
;	out: "6", 
;	in: {
;		function: "MessageBox",
;		args : [
;			{arg: "0", type: "Int"},
;			{arg: "Press Yes or No", type: "Str"},
;			{arg: "Title of box", type: "Str"},
;			{arg: "4", type: "Int"}
;		]
;	}
;}

;########################################################################
;#				LIBRARIES				#
;########################################################################

;Get command line arguments function
;By SKAN https://autohotkey.com/boards/viewtopic.php?t=4357
Args( CmdLine := "", Skip := 0 ) {     ; By SKAN,  http://goo.gl/JfMNpN,  CD:23/Aug/2014 | MD:24/Aug/2014
  Local pArgs := 0, nArgs := 0, A := []
  
  pArgs := DllCall( "Shell32\CommandLineToArgvW", "WStr",CmdLine, "PtrP",nArgs, "Ptr" ) 

  Loop % ( nArgs ) 
     If ( A_Index > Skip ) 
       A[ A_Index - Skip ] := StrGet( NumGet( ( A_Index - 1 ) * A_PtrSize + pArgs ), "UTF-16" )  

Return A,   A[0] := nArgs - Skip,   DllCall( "LocalFree", "Ptr",pArgs )  
}

;Wrapper for SKAN's command arguments function.
GetParamArray(){

	CmdLine := DllCall( "GetCommandLine", "Str" )
	Skip    := ( A_IsCompiled ? 1 : 2 )
	p	:= Args( CmdLine, Skip )
	
	return p
}

StrJoin(obj,delimiter:="",OmitChars:=""){
	string:=obj[1]
	Loop % obj.MaxIndex()-1
		string .= delimiter Trim(obj[A_Index+1],OmitChars)
	return string
}