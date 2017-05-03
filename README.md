# LaunchMenu

## Description:

LaunchMenu is an open source utility application similar to LaunchBar and SpotlightSearch for Mac.

Features will be listed at a later date.

## Details:

15 April 2017 18:15 Backup: 

https://puu.sh/vlb0u/2bc1c6a596.tar

New workspace PHP Apache workspace: 

https://ide.c9.io/sancarn/launchmenu_ahk#openfile-README.md

## C9 Interactions with Github:

### Commit changes to Github:

```
git add . 
git commit -m "<Name of commit>"
git push -u origin master
```

### Get changes from Github:
```
git pull origin master
```

## To Do

* [X] FuzzySearch to handle tree type.
* [X] File searching display
* [X] Search highlighting.
* [X] Scrolling beyond the current range.
* [X] File navigation with arrows and mouse
* [X] Animated window expanding/contracting
* [ ] {30%} File preview
* [ ] {10%} Implement myFile.lmf HTML preview.
* [ ] {25%} Context specific menus - If I have Window X active, and I open the GUI I want stuff related to that stuff.
* [ ] {10%} File icons/symbols in list of matches
* [ ] Server client communication file.
* [ ] Preview non image formats and stuff - https://github.com/maxlabelle/filepreview
* [ ] Settings menu.
* [ ] FileList includes zip folders.
* [ ] Custom themes
* [ ] Implement myFile.LMMenu json files for custom menu actions.
* [ ] Javascript custom actions - Maybe use require('eval')(theJSCode).
* [ ] Create a windows messages API for use by other developers in other programming languages. Some actions: LaunchTerm(someTerm), UnregisterKeybind() and RegisterKeybind() {devs may need use of cmd/win+space for other stuff}, getMatches(searchTerm)...
* [ ] Explore Capability of making LaunchMenu a Mac - Scriptable App: https://developer.apple.com/library/mac/documentation/AppleScript/Conceptual/AppleScriptX/Concepts/scriptable_apps.html
* [ ] Ability to search for folders
* [ ] Ability to search in selected folders (use '/' or '\' prefix '\myAmazingFolder' )
* [ ] Ability to search in the contents of files.
* [ ] Ability to search for files using regex.
* [ ] Deprecate .LMP & .LMM files. Move to .LMF (Launch Menu Format). These files will store the preview and all assosciated files with that file.
* [ ] Applets System: ColorPicker, Calculator, Dictionary, Web Search
* [ ] Add some method to call applets given search term / pattern (js callback)
* [ ] Add methods to call global applets etc.
* [ ] Launch Menu Events. Example: Whenever LaunchMenu is activated, run "activated.event.js"
* [ ] Event system with pre and postevent listeners; for instance for start event
* [ ] Server communication wrapper requires error messages.
* [ ] Auto-documentation generation.
* [ ] Server communication support for more than 1 callback
* [ ] _ipc.on support?


Sancarn's todo:

* Test general scrollbar stuff.
* Test scrollmenu expand/collapse animation - is setSize() called at the moment?
* Test server communication functions.
* Test GetActiveWindow Mac functions with npm jxa        [needs fully implementing]
* Test GetActiveWindow Windows functions with npm ffi    [needs fully implementing]
* Test Edge-VB.JS (possibly better than keeping an external application) 
* Write node-js file list generator 
* Make get icons multi-os compatible - also get larger icons on windows option!
* General ini-file management.
* 
