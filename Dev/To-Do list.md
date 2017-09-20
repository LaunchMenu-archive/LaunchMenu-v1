
## General To Do

* [ ] {50%} File preview
* [ ] {25%} Context specific menus - If I have Window X active, and I open the GUI I want stuff related to that stuff.
* [ ] {10%} File icons/symbols in list of matches
* [ ] Applets to build:
	* [ ] ColorPicker
	* [ ] Calculator
	* [ ] Dictionary
	* [ ] Web Search
	* [ ] Translate
	* [ ] Notes
	* [ ] Regexr
	* [ ] Music player
	* [ ] Log Maker
	* [ ] Search-In-Files
	* [ ] Discord chat
* [ ] IPC access to main BrowserWindow functions and settings via proxy wrapper. (or instead use a system similar to the window system, to execute code on server side)
* [ ] Auto-documentation generation.
* [ ] log server-side errors on the client side.

## Tar's todo list:
* [x] FuzzySearch to handle $Tree type.
* [x] File searching display
* [x] Search highlighting.
* [x] Scrolling beyond the current range.
* [x] File navigation with arrows and mouse
* [x] Animated window expanding/contracting
* [x] Custom themes
* [ ] LaunchMenu searches
	* [x] Ability to search for folders
	* [x] Ability to search for files using regex.
	* [x] Ability to search in selected folders (use '/' or '\' prefix '\myAmazingFolder' ), skipped because we can now navigate and to folders and search through them
	* [ ] Ability to search for file paths. E.G. `/My Excel Files/.*/my.csv/i`
* [x] Make worker for finding matches

* [x] make a cut system
* [x] create rightclick menu
* [x] turn utilities into util object to get rid of floating variables  
* [x] create event system:
	* [x] autoprefix classname if available in name
	* [x] make listeners work with parent class prefix
	* [x] make open events not fire post events if canceled
	* [x] add more events
* [x] tab menu when hovering over an item <-- include in this, go to parent directory
* [x] right click menu system
* [x] fix contextSubMenu not closing  when parent closes
* [x] format date properly
* [x] make escape work then the searhbar contains a value
* [x] number of children search term
* [x] create sub-window system
	* [ ] using mouseenter and mouseleave events make transparent areas of main LaunchMenu window ignore/unignore mouse events using: win.setIgnoreEvents(true/false)
	* [x] use `-webkit-app-region: drag` style to make sub-window a draggable window (optionally)
 	* [ ] add global events to the window system
	* [ ] change the main window to make use of the new window system
	* [ ] make it so a window closes its sub windows when closed
* [x] create settings system and menu, with on change events etc
	* [x] create settings system with events
	* [x] make settings accessable from different windows through the main window
	* [x] create settings GUI
	* [ ] create elements for all comon variable types
		* [x] strings
		* [x] numbers
		* [x] booleans
		* [x] colors
		* [x] shortcuts
		* [ ] images
	* [x] create styling interface through settings
		* [ ] create system for targetting individual elements
	* [ ] refactor the styling system and inteface
		* [ ] make styling interface elements grouped and collapsable, so it doesn't need to load everything right away
		* [ ] make styling use css variables so that any proeprty can be altered instead of using html classes
	* [ ] make it so you can open settings to go to a certain setting and or category
	* [ ] make it so you can open a specific setting category
* [ ] multi file selection
* [ ] make selector use the new scrollbar system
* [ ] create keyboard navigation system similar to  mnemonics
* [ ] Applets System:
	* [ ] Initial Applet module.
	* [ ] LMF file format. (JSON5? <- wtf?)
	* [ ] Custom HTML preview of LMF file for LaunchMenu's treeview.
	* [ ] HTML, CSS, JS compiled into 1 place.
	* [ ] Setup custom preview and actions system with the .lmf file
	* [ ] Add some method to call applets given search term / pattern (js callback)
* [x] Don't browse from system root, instead show a list of LM roots
* [x] Refactor $Settings to make it class more modular, so people can alter its behaviour.
* [ ] Refactor $Querier to make it class more modular, so people can alter its behaviour.
* [ ] Refactor $Tree so it fits the js style of class better
* [ ] LaunchMenu Events for all important things that happen in LM.
* [ ] add menu to access different search and filter options, like order by date (to an extend, as the match value should also count), disable certain match types, any other options you might want
* [ ] make it so you can browse folders that aren't part of the root
	* [ ] indicate in which directory you are currently
	* [ ] make a way to enter an absolute path
* [ ] add a path bar in which you can see and alter the current location, keep the styling low key
	* [ ] make a drop down for every directory, to show what they can be echanged with
* [ ] make selectors make use of the new scrollbar element instead of the library
* [ ] change how the setting/categoryAbove works, make the setting a child in the gui of the setting/categoryAbove

## Sancarn's todo list:

* [x] Filelist
	* [ ] FileList includes zip folders.
* [ ] Sync9
* [ ] Test GetActiveWindow functions Mac and Windows
* [x] Test Edge-VB.JS (possibly better than keeping an external application). EdgeJS will not be a viable option for this application as it is not portable.
* [x] Write node-js file list generator 
* [ ] Make get icons multi-os compatible - also get larger icons on windows option!
* [ ] General ini-file management.
* [ ] DynaCLR.JS - 90%
* [ ] DynaCOM.JS - 10%?
* [ ] DynaDll.JS - 50%?
* [ ] Use Enigma Virtual Box to package electron app to pure .exe file - http://enigmaprotector.com/en/aboutvb.html
* [ ] PDF Preview.
* [ ] Preview non image formats - XLSX/DOCX/PPTX --> PDF
* [ ] Windows Messages using Function win.hookWindowMessage(message, callback):
	WM_USER+1 --> Eval(COPYDATA_STRUCT) & WM_USER+2 --> Eval(LMF). 
* [ ] Explore Capability of making LaunchMenu a Mac - Scriptable App:
	https://developer.apple.com/library/mac/documentation/AppleScript/Conceptual/AppleScriptX/Concepts/scriptable_apps.html
* [ ] Implement .lmf file auto-executables. LMF files will be reditected to a BAT file (or maybe a small exe?). It will inject the script's path into a named pipe `LMF_InjectionPipe`:

CMD commands (Setting lmf as auto-executable file):

```BAT
assoc .lmf=LaunchMenu
ftype LaunchMenu="path\to\lminject.bat" "%%1"
```

BAT file command for script injection:

```BAT
type %1 >\\.\pipe\lm_inject
```

lmf file's code will be injected to the pipe. Here they will be read by the program.
