/*global variables Class, ActionMenu, ActionMenuHandler, fileSelector, Searchbar, ActionMenuStandard*/
var ActionMenuDefault = Class("ActionMenuDefault",{
    actions: [],
    default: true,
    executeFile: function(file){
        console.log("execute",file);
        return true;
    }
}, ActionMenuStandard);
ActionMenuHandler.registerActionMenuType(new ActionMenuDefault());