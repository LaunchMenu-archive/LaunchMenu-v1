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
* [ ] {10%} Implement myFile.LMPreview HTML crap.
* [ ] {25%} Context specific menus - If I have Window X active, and I open the GUI I want stuff related to that stuff.
* [ ] Server client communication file.
* [ ] Preview non image formats and stuff - https://github.com/maxlabelle/filepreview
* [ ] Settings menu.
* [ ] FileList includes zip folders.
* [ ] File icons/symbols in list of matches
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
* [ ] 
