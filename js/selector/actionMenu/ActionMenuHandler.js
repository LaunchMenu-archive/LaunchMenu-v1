/*global variables File, Directory, FileSelectorItem*/
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
    
    amh.getActionMenuFromFile = function(file){
        if(file instanceof File){
            var n = actionMenuByExtension[file.extension];
            if(!n) n = defaultActionMenu;
            return (n instanceof Array)?n[0]:n;
        }else if(file instanceof Directory){
            return  directoryActionMenu;
        }else{
            throw new Error("first argument must be either a file or a directory");
        }
    };
    amh.executeFile = function(file){
        amh.getActionMenuFromFile(file).executeFile(file);
    };
    amh.openFileItemMenu = function(fileItem){
        if(FileSelectorItem.classof(fileItem)){
            var am = amh.getActionMenuFromFile(fileItem.file);
            am.openFileItem(fileItem);
        }else{
            throw Error("argument must be an instance of FileSelectorItem");
        }
    };
    amh.openFileItemContextMenu = function(fileItem, offset){
        if(FileSelectorItem.classof(fileItem)){
            var am = amh.getActionMenuFromFile(fileItem.file);
            am.openContextMenu(fileItem, offset);
        }else{
            throw Error("argument must be an instance of FileSelectorItem");
        }
    };
    
    return amh;
})();