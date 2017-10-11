/*global variables File, Directory, FileSelectorItem, $EventHandler*/
loadOnce("/$EventHandler");
window.$FileMenuHandler = (function(){
    var fileMenuList = [];
    var fileMenuByExtension = {};
    var defaultFileMenu;
    var directoryFileMenu;
    var amh = {
        get fileMenuList(){
            return fileMenuList;
        },
        get fileMenuByExtension(){
            return fileMenuByExtension;
        },
        get defaultFileMenu(){
            return defaultFileMenu;
        },
        get directoryFileMenu(){
            return directoryFileMenu;
        }
    };
    
    amh.registerFileMenuType = function(fileMenuClass){
        var fileMenu = new fileMenuClass();
        if(fileMenuList.indexOf(fileMenu)!=-1){
            throw new Error("FileMenu type is already registered");
        }else{
            fileMenuList.push(fileMenu);
            var n = fileMenuByExtension;
            for(var i=0; i<fileMenu.extensions.length; i++){
                var ext = fileMenu.extensions[i];
                
                if(n[ext]){
                    if(!(n[ext] instanceof Array)) n[ext] = [n[ext]];
                    n[ext].push(fileMenu);
                }else{
                    n[ext] = fileMenu;
                }
            }
            
            if(fileMenu.default)
                defaultFileMenu = fileMenu;
            if(fileMenu.directory)
                directoryFileMenu = fileMenu;
        }
    };
    
    amh.getFileMenuFromFile = function(file){
        if(file instanceof File){
            var n = fileMenuByExtension[file.extension];
            if(!n) n = defaultFileMenu;
            return (n instanceof Array)?n[0]:n;
        }else if(file instanceof Directory){
            return  directoryFileMenu;
        }else{
            throw new Error("first argument must be either a file or a directory");
        }
    };
    amh.executeFile = function(file){
        if($EventHandler.trigger("$FileMenuHandler.executeFile:pre", this, {file: file})){
            var result = amh.getFileMenuFromFile(file).executeFile(file);
            
            $EventHandler.trigger("$FileMenuHandler.executeFile:post", this, {file: file});
            return result;
        }
        return false;
    };
    amh.openFileItemMenu = function(fileItem){
        if(fileItem instanceof FileSelectorItem){
            var am = amh.getFileMenuFromFile(fileItem.file);
            if($EventHandler.trigger("$FileMenuHandler.openFileItemMenu:pre", this, {
                fileItem: fileItem,
                fileMenu: am
            })){
                var result = am.openFileItem(fileItem);
                
                $EventHandler.trigger("$FileMenuHandler.openFileItemMenu:post", this, {
                    fileItem: fileItem,
                    fileMenu: am
                });  
                return result;
            }
            return false;
        }else{
            throw Error("argument must be an instance of FileSelectorItem");
        }
    };
    amh.openFileItemContextMenu = function(fileItem, offset){
        if(fileItem instanceof FileSelectorItem){
            var am = amh.getFileMenuFromFile(fileItem.file);
            if($EventHandler.trigger("$FileMenuHandler.openFileItemContextMenu:pre", this, {
                fileItem: fileItem,
                fileMenu: am,
                contextMenu: am.contextMenu
            })){
                var result = am.openContextMenu(fileItem, offset);
                
                $EventHandler.trigger("$FileMenuHandler.openFileItemContextMenu:post", this, {
                    fileItem: fileItem,
                    fileMenu: am,
                    contextMenu: am.contextMenu
                });  
                return result;
            }
        }else{
            throw Error("argument must be an instance of FileSelectorItem");
        }
    };
    
    //TODO add navigation functions like $ContextMenuHandler has
    return amh;
})();