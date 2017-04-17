#NoEnv
#SingleInstance Force
#Persistent
SetWorkingDir %A_ScriptDir%
Gui New, -MinimizeBox -MaximizeBox -SysMenu -Caption +hwndHGui +AlwaysOnTop
FrameShadow(HGui)
Gui Color, White
Gui, font, s15, Verdana  
Gui Add, Edit, x+0 y+10 w620 h40 -E0x200 gSearch vSearch -VScroll -Background, 
Gui Show, y120 w630 h50, ahkSearchWindow
SetTimer, GuiTimer, 50
Return


GuiTimer:
	ifWinNotActive ahk_id %HGui%
	{
		WinHide, ahk_id %HGui%
		SetTimer, GuiTimer, Off
	}
Return

#space::
	WinShow, ahk_id %HGui%
	WinActivate, ahk_id %HGui%
	SetTimer, GuiTimer, 50
Return

Search:
	Gui Submit, nohide
	bQueryFound := 0
	
	If bQueryFound(search)
	{
		;Show findings
		;wb.window.myFunctionName(myString)
		
		;If gui not expanded expand it
		If !bExpanded
		{
			Gui, Show, y120 w630 h400, ahkSearchWindow
			bExpanded := true
		}
	} Else {
		;Hide dialog
		Gui Show, y120 w630 h50, ahkSearchWindow
		bExpanded := false
		
		If StrLen(search) > 0
		{
			;Display 'nothing found'?
		}
	}
	;Gui 2: +AlwaysOnTop -SysMenu -Caption
	;Gui 2: Show, y110 w630 h50, ahkSearchWindow_subWin
return


GuiResize(x,dx,y,dy,w,dw,h,dh,_fps=30,_seconds=2){
	_steps := _seconds * _fps
	_sleep := _seconds / _steps
	
	i:=0
	while i < _steps
	{
		multiplier := (i/_steps)**2
		tx:=x+dx*multiplier
		ty:=y+dy*multiplier
		tw:=w+dw*multiplier
		th:=h+dh*multiplier
		Gui Show, x%tx% y%ty% w%tw% h%th%
		sleep, % _seconds / _fps
		i++
	}
}

FrameShadow(HGui) {
	;Src: https://autohotkey.com/boards/viewtopic.php?f=6&t=29117&p=136780&hilit=drop+shadow#p136780
	DllCall("dwmapi\DwmIsCompositionEnabled","IntP",_ISENABLED) ; Get if DWM Manager is Enabled
	if !_ISENABLED ; if DWM is not enabled, Make Basic Shadow
		DllCall("SetClassLong","UInt",HGui,"Int",-26,"Int",DllCall("GetClassLong","UInt",HGui,"Int",-26)|0x20000)
	else {
		VarSetCapacity(_MARGINS,16)
		NumPut(1,&_MARGINS,0,"UInt")
		NumPut(1,&_MARGINS,4,"UInt")
		NumPut(1,&_MARGINS,8,"UInt")
		NumPut(1,&_MARGINS,12,"UInt")
		DllCall("dwmapi\DwmSetWindowAttribute", "Ptr", HGui, "UInt", 2, "Int*", 2, "UInt", 4)
		DllCall("dwmapi\DwmExtendFrameIntoClientArea", "Ptr", HGui, "Ptr", &_MARGINS)
	}
}

WM_LBUTTONDOWN(wParam, lParam, msg, hwnd) {
	static init := OnMessage(0x0201, "WM_LBUTTONDOWN")
	PostMessage, 0xA1, 2,,, A
}

GuiActive(){
	Global HGui
	IfWinActive ahk_id %HGui%
		return true
}

#If GuiActive()
Enter::
	Gui Submit
	if Search = Reset
		Reload
	Else
	{
		msgbox, %Search%
		
	}
	ControlSetText, Edit1,
return

Esc::
    Gui, Submit, NoHide
	If Search
		ControlSetText, Edit1,
	Else
		WinHide, ahk_id %HGui%
Return






;FAILED BECAUSE GUIGETPOS() DOESN'T WORK??
;GuiNewSize(hwnd,nx=-1,ny=-1,nw=-1,nh=-1,_fps=30,_seconds=2){
;	_steps := _seconds * _fps
;	_sleep := _seconds / _fps
;	
;	GuiGetPos( hwnd, x, y, w, h)
;	msgbox x%x% y%y% w%w% h%h%
;	
;	dx:= nx=-1 ? 0 : nx-x
;	dy:= ny=-1 ? 0 : ny-y
;	dw:= nw=-1 ? 0 : nw-w
;	dh:= nh=-1 ? 0 : nh-h
;	
;	i:=0
;	while i < _steps
;	{
;		multiplier := (i/_steps)**2
;		tx:=x+dx*multiplier
;		ty:=y+dy*multiplier
;		tw:=w+dw*multiplier
;		th:=h+dh*multiplier
;		;msgbox x%tx% y%ty% w%tw% h%th%
;		Gui Show, x%tx% y%ty% w%tw% h%th%
;		sleep, % _seconds / _fps
;		i++
;	}	
;}
;GuiGetPos(hwnd, ByRef x, ByRef y, ByRef w, ByRef h)
;{
;	wingetpos, x, y, _w, _h, ahk_id %hwnd%
;    VarSetCapacity(rc, 16)
;    DllCall("GetClientRect", "uint", hwnd, "uint", &rc)
;    w := NumGet(rc, 8, "int")
;    h := NumGet(rc, 12, "int")
;}