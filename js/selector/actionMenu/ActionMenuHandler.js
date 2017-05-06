/*global variables File, Directory*/
var ActionMenuHandler = (function(){
    var actionMenuList = [];
    var actionMenuByExtension = {};
    var defaultActionMenu;
    var directoryActionMenu;
    var amh = {
        get actionMenuList(){
            return actionMenuList;
        },
        get actionMenuByExtension(){
            return actionMenuByExtension;
        },
        get defaultActionMenu(){
            return defaultActionMenu;
        },
        get directoryActionMenu(){
            return directoryActionMenu;
        }
    };
    
    amh.registerActionMenuType = function(actionMenu){
        if(actionMenuList.indexOf(actionMenu)!=-1){
            throw new Error("ActionMenu type is already registered");
        }else{
            actionMenuList.push(actionMenu);
            var n = actionMenuByExtension;
            for(var i=0; i<actionMenu.extensions.length; i++){
                var ext = actionMenu.extensions[i];
                
                if(n[ext]){
                    if(!(n[ext] instanceof Array)) n[ext] = [n[ext]];
                    n[ext].push(actionMenu);
                }else{
                    n[ext] = actionMenu;
                }
            }
            
            if(actionMenu.default)
                defaultActionMenu = actionMenu;
            if(actionMenu.directory)
                directoryActionMenu = actionMenu;
        }
    };
    
    amh.getActionMenuFromExtension = function(extension){
        var n = actionMenuByExtension[extension];
        if(!n) return defaultActionMenu;
        return (n instanceof Array)?n[0]:n;
    };
    amh.openFileMenu = function(file){
        var n;
        if(file instanceof File){
            n = amh.getActionMenuFromExtension(file.extension);
        }else if(file instanceof Directory){
            n = directoryActionMenu;
        }else{
            throw new Error("first argument must be either a file or a directory");
        }
        
        n.openFile(file);
    };
    amh.executeFile = function(file){
        var n;
        if(file instanceof File){
            n = amh.getActionMenuFromExtension(file.extension);
        }else if(file instanceof Directory){
            n = directoryActionMenu;
        }else{
            throw new Error("first argument must be either a file or a directory");
        }
        
        n.executeFile(file);
    };
    
    return amh;
})();