/*global variables Class, ActionMenu, ActionMenuHandler, fileSelector, Searchbar*/
var ActionMenuDefault = Class("ActionMenuDefault",{
    actions: [],
    default: true,
    executeFile: function(file){
        console.log("execute",file);
    }
}, ActionMenu);
ActionMenuHandler.registerActionMenuType(new ActionMenuDefault());