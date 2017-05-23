#include CLR.ahk

;How to execute AHK as console application:
;http://autohotkey.com/board/topic/52576-ahk-l-output-to-command-line/?p=372590
;#############################################################

;Get all parameters
p := GetParamArray()

if p.length() = 0 {
	FileAppend Error: Too few parameters. Type Compiler.exe /? for details on how to use this utility., **
	ExitApp
}

help=
(

Usage:
	Compiler.exe [<Options...>] <Code path...> [<References path...>] [<Exe path...>]
	
Options [optional]:
	/? = Help
	/C = Compile only. This is the default flag.
	/R = Compile & Run
	/L:{c#/vb} = Language
	
	Note:
		The language flag is normally not required. It is only ever required if C# or VB code is stored in a file other than a .cs and .vb file (respectively).

Code path:
	This file contains VB.NET or C#.NET code to be compiled.
	E.G. C:\Programming\Hello.cs
	Example Contents:
		using System;
		public class HelloWorld
		{
			static public void Main ()
			{
				Console.WriteLine ("Hello World");
			}
		}
	
References path:
	This is a file path (relative or otherwise) to a file containing paths to references.
	If left blank this file defaults to codepath with the extension '.def'.
	E.G. C:\Programming\Hello_Refs.txt
	Example Contents:
		system.dll
		system.windows.forms.dll
		C:\my\awesome\dlls\areAwesome.dll
	
Exe path:
	This is the path where you want the compiled .exe file to be produced.
	If left blank this file defaults to codepath with the extension '.exe'.
	E.G. C:\Programming\Hello.exe
	
Dependencies:
	Microsoft Common Language Runtime (CLR) / .NET Framework.
)

;Get arg1 and arg2 -- Codepath and options
iStart:=0
if(strlen(regexreplace(p[1],"i)(?:\/(?:\?|c|r|l)|help)",""))>0){
	;Arg1 doesn't exist
	if(fileexist(p[1])){
		arg1 := {Mode:"Compile",Language:"XX"}
		arg2 := p[1]
		iStart := 1
	} else {
		FileAppend Error: File doesn't exist., **
		return
	}
} else {
	iStart := 2
	;Arg1 contains options
	If(p[1]~="i)\/\?" or p[1]~="i)help"){
		FileAppend %help%, *
		return
	}
	
	arg1 := {}
	arg2 := p[2]
	If(p[1]~="\/R"){
		arg1.Mode := "Run"
	} else {
		arg1.Mode := "Compile"
	}
	
	;Default Language = XX
	arg1.Language := "XX"
	If(p[1]~="i)\/L:\{(.+?)\}"){
		RegexMatch(p[1],"iO)\/L:\{(.+?)\}",oMatch)
		if(oMatch.Value(1)~="i)(c#|cs)"){
			arg1.Language := "C#"
		} else if (oMatch.Value(1)~="i)(vb)") {
			arg1.Language := "VB"
		}	
	}
}

;Get default languages
if(arg1.Language = "XX"){
	_ := arg2
	SplitPath, _,_,_,Ext
	if(Ext~="i)cs"){
		arg1.Language := "C#"
	} else if(Ext~="i)vb") {
		arg1.Language := "VB"
	} else {
		FileAppend Error: Unknown programming language... "%Ext%", **
		return
	}
}

;Get definition path
if(p[iStart+1]){
	arg3 := p[iStart+1]
} else {
	_ := p[iStart+1]
	SplitPath, _, _, Dir, Ext, Name
	arg3 := Dir + Name + ".def"
}

;Get compile-to location
if(p[iStart+2]){
	arg4 := p[iStart+2]
	;C:\Users\sancarn\Desktop\Mono-testing\CompilerV2\Test\myLife.exe
} else {
	_ := p[iStart+2]
	SplitPath, _, _, Dir, Ext, Name
	arg4 := Dir + Name + ".exe"
}

;If compilation successful and mode == run then run the compiled file
if(Compile(arg1,arg2,arg3,arg4)){
	if(arg1.Mode = "Run"){
		run, arg4
	}
}
return

Compile(oOptions,fCode, fDefs, fExe){
	try {
		sCode := fFileRead(fCode)
		
		;It would be nice if fDefs were generated if not provided (when standard)
		sDefs := fFileRead(fDefs)
		sDefs := regexreplace(sDefs,"(\r|\n)+","|")
		
		;Get appdomain
		if(oOptions.AppDomain){
			AppDomain := oOptions.AppDomain
		} else {
			AppDomain := 0
		}
		
		;Get CompilerOptions
		if(oOptions.CompilerOptions){
			CompilerOptions := oOptions.CompilerOptions
		} else {
			CompilerOptions := ""
		}
		
		msgbox, % oOptions.Language
		
		;Compile!!
		if(oOptions.Language="C#"){
			CLR_CompileC#(sCode,sDefs,AppDomain,fExe,CompilerOptions)
		} else if(oOptions.Language="VB"){
			CLR_CompileVB(sCode,sDefs,AppDomain,fExe,CompilerOptions)
		}
		
		return true
	} catch e {
		FileAppend Error: Unknown error occurred., **
		FileAppend %e%, **
		return false
	}
}

;Get command line arguments function
;By SKAN https://autohotkey.com/boards/viewtopic.php?t=4357
;By SKAN,  http://goo.gl/JfMNpN,  CD:23/Aug/2014 | MD:24/Aug/2014
Args( CmdLine := "", Skip := 0 ) {
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

fFileRead(file){
	try {
		Fileread, text, %file%
	} catch e {
		text := ""
	}
	return text
}