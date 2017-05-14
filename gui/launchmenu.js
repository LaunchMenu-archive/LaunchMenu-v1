/*global variables FileSelector, searchbar, SelectorHandler, $, tree, Searchbar, ContextMenu, ContextMenuHandler*/
var Main = (function(){
    var fileSelector = new FileSelector();
    var cutFile;
    var Main = {
        get fileSelector(){
            return fileSelector;
        },
        get cutFile(){
            return cutFile;
        },
        set cutFile(file){
            if(file)
                file.setCut(true);
            else
                Main.resetCutFile();
        }
    };
    
    //initialise
    {
        //keyboard event listeners
        {
            Searchbar.addEventListener(function(event){
                return ContextMenuHandler.keyboardEvent(event);
            });
            Searchbar.addEventListener(function(event){
                return SelectorHandler.keyboardEvent(event);
            });
            Searchbar.addEventListener(function(event){
                if(event.key=="Escape"){
                    if(fileSelector.directory.parent){
                        Searchbar.setText("");
                        fileSelector.setDirectory(tree);
                    }else{
                        
                    }
                }    
            });
        }
        
        //searhvalue listeners
        {
            Searchbar.addValueListener(function(value){
                return SelectorHandler.searchbarChange(value);
            });
        }
        
        //right click setup
        {
            ContextMenuHandler.setDefaultContextMenu(new ContextMenu([
                {
                    text: "close",
                    func: function(){
                        console.log("close");   
                    }
                }
            ]));
            $(window).bind("contextmenu", function(e){ //prevent default context menu
                e.preventDefault();
            });
        }
        
        
        $(function(){
            fileSelector.open(0);
        });
    }
    Main.setCutFile = function(file){
        if(cutFile)
            Main.resetCutFile();
        if(!file.cut)
            file.setCut(true);
        cutFile = file;
    };
    Main.resetCutFile = function(){
        if(cutFile){
            if(cutFile.cut)
                cutFile.setCut(false);
            cutFile = null;
        }
    };
    
    return Main;
})();