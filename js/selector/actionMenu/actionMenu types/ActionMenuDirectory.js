/*global variables Class, ActionMenu, ActionMenuHandler, fileSelector, Searchbar*/
var ActionMenuDirectory = Class("ActionMenuDirectory",{
    actions: [],
    directory: true,
    executeFile: function(directory){
        fileSelector.setDirectory(directory);
        Searchbar.clear();
    }
}, ActionMenu);
ActionMenuHandler.registerActionMenuType(new ActionMenuDirectory());