# LaunchMenu

![LaunchMenu Icon](Icon.png)


## Description:

LaunchMenu is an open source utility application similar to LaunchBar and SpotlightSearch for Mac.

Features will be listed at a later date.

## Screen Shots:

![Directory Preview](Screen%20shots/general.png) 

#searches
![Literal Search](/Screen shots/literal search.png) ![Acronym Search](/Screen shots/acronym search.png)

## Details:

14 May 2017 18:15 Backup: 

https://puu.sh/vPVBg/7e95625707.gz

New workspace PHP Apache workspace: 

https://ide.c9.io/sancarn/launchmenu#openfile-README.md

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
|---------------------------------------|-----------------------------------------------|
|<kbd>Alt</kbd>+<kbd>Space</kbd>        | Open LaunchMenu                               |
|<kbd>Up</kbd>                          | Go up in selector                             |
|<kbd>Down</kbd>                        | Go down in selector                           |
|<kbd>Enter</kbd>                       | Execute item (for instance open directory)    |
|<kbd>Shift</kbd>+<kbd>Enter</kbd>      | Goto previous view                            |
|<kbd>Ctrl</kbd>+<kbd>Enter</kbd>       | Goto the parent of the current directory      |
|<kbd>Tab</kbd>                         | Open action menu of selected file             |
|<kbd>Shift</kbd>+<kbd>Tab</kbd>        | Close action menu                             |
|<kbd>Esc</kbd>                         | Go back to root, if in root close program     |
