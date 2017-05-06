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

### Count lines of code in directory:
```
find . -name '*.js' | awk '{gsub(" ","\\ ", $0);print $0}' |xargs wc -l
```

launch-menu-search syntax:
    
    search with regex:
    
        `/<myRegexString>/<flags>`
    
    search with minimum number of characters:
    
        `<yourSearch>?min:4;`
    
    search with maximum number of characters:
    
        `<yourSearch>?max:4; `
    
    search by type of file (file/directory):
    
        `<yourSearch>?type:f;`
        `<yourSearch>?type:d;`
    
    search with inverted word search:
    
        `<yourSearch>?not:<someWords>,<someWords>,...;`
    
    You can combine any of the above like this:
    
        `White?not:Lettuce;min:12`
                   
    The above will match `WhiteCabbage` but won't match `WhiteLettuce` or `WhitePotato`
    
    
    You can also skip out the property name like this:
    
        `a?2;4;`
    
    the above would search for any file containing a which is between 2 and 4 characters long.
    _note: the first argument is always interprated as the minimum and the 2nd argument is interprated as the maximum_

Keyboard shorcuts:

| Keys                                  | Description                                   |
|:-------------------------------------:|-----------------------------------------------|
|<kbd>Alt</kbd>+<kbd>Space</kbd>        | open launch menu                              |
|<kbd>Enter</kbd>                       | execute item (for instance open directory)    |
|<kbd>Shift</kbd>+<kbd>Enter</kbd>      | goback to previous directory                  |
|<kbd>Ctrl</kbd>+<kbd>Enter</kbd>       | goto parent directory                         |
|<kbd>Tab</kbd>                         | open action menu of selected file             |
|<kbd>Shift</kbd>+<kbd>Tab</kbd>        | close action menu                             |
|<kbd>Up</kbd>                          | go up in selector                             |
|<kbd>Down</kbd>                        | go down in selector                           |
|<kbd>Esc</kbd>                         | go back to root, if in root close program     |

    
## To Do

* [X] FuzzySearch to handle tree type.
* [X] File searching display
* [X] Search highlighting.
* [X] Scrolling beyond the current range.
* [X] File navigation with arrows and mouse
* [X] Animated window expanding/contracting
* [X] Custom themes
* [X] Ability to search for folders
* [X] Ability to search for files using regex.
* [X] Ability to search in selected folders (use '/' or '\' prefix '\myAmazingFolder' ), skipped because we can now navigate and to folders and search through them 
* [ ] {50%} File preview
* [ ] {10%} Implement myFile.lmf HTML preview.
* [ ] {25%} Context specific menus - If I have Window X active, and I open the GUI I want stuff related to that stuff.
* [ ] {10%} File icons/symbols in list of matches
* [ ] Server client communication file.
* [ ] Preview non image formats and stuff - https://github.com/maxlabelle/filepreview
* [ ] Settings menu.
* [ ] FileList includes zip folders.
* [ ] Javascript custom actions - Maybe use require('eval')(theJSCode).
* [ ] Create a windows messages API for use by other developers in other programming languages. Some actions: LaunchTerm(someTerm), UnregisterKeybind() and RegisterKeybind() {devs may need use of cmd/win+space for other stuff}, getMatches(searchTerm)...
* [ ] Explore Capability of making LaunchMenu a Mac - Scriptable App: https://developer.apple.com/library/mac/documentation/AppleScript/Conceptual/AppleScriptX/Concepts/scriptable_apps.html
* [ ] Ability to search in the contents of files.
* [ ] Deprecate .LMP & .LMM files. Move to .LMF (Launch Menu Format). These files will store the preview and all assosciated files with that file.
* [ ] Applets System: ColorPicker, Calculator, Dictionary, Web Search, Translate, Notes, Regexr
* [ ] Add some method to call applets given search term / pattern (js callback)
* [ ] Add methods to call global applets etc.
* [ ] Launch Menu Events. Example: Whenever LaunchMenu is activated, run "activated.event.js"
* [ ] Event system with pre and postevent listeners; for instance for start event
* [ ] Server communication wrapper requires error messages.
* [ ] Auto-documentation generation.
* [ ] Server communication support for more than 1 callback
* [ ] _ipc.on support?
* [ ] right click menu system
* [ ] shortcut dictonary popup dick
* [ ] tab menu when hovering over an item <-- include in this, go to parent directory


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
