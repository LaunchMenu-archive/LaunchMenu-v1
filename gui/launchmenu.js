/*global variables FileSelector, searchbar, $SelectorHandler, $, $Tree, $Searchbar, ContextMenu, $ContextMenuHandler*/
//import classes
//import types
$ScriptLoader.loadDir("/preview/previewTypes");
$ScriptLoader.loadDir("/selector/fileMenu/fileMenuTypes");
$ScriptLoader.loadDir("/styling/styles");

//import handlers
$ScriptLoader.loadOnce("/preview/$PreviewHandler.js");
$ScriptLoader.loadOnce("/selector/$SelectorHandler.js");
$ScriptLoader.loadOnce("/contextMenu/$ContextMenuHandler.js");

//import other classes
$ScriptLoader.loadOnce("/searchbar/$Searchbar.js");
$ScriptLoader.loadOnce("/selector/selectorTypes/FileSelector");

$ScriptLoader.loadOnce("/settings"); //outdated
$ScriptLoader.loadOnce("/serverCommunication");
$ScriptLoader.loadOnce("settings/$Settings");
$ScriptLoader.loadOnce("settings/GUI/SettingsWindowController");
//$ScriptLoader.loadOnce("/subWindow/subWindow");

window.$Main = (function(){
	new SettingsWindowController();
	
    var fileSelector = new FileSelector();
    var $Main = {
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
                $Main.resetCutFile();
        }
    };
    
    //initialise
    {
        //keyboard event listeners
        {
            $Searchbar.addEventListener(function(event){
                return $ContextMenuHandler.__keyboardEvent(event);
            });
            $Searchbar.addEventListener(function(event){
                return $SelectorHandler.__keyboardEvent(event);
            });
            $Searchbar.addEventListener(function(event){
                if(event.key=="Escape"){
                	if(fileSelector.isOpen()){ //might need to catch escape event in other menus instead
                		if(fileSelector.directory.parent || fileSelector.searchTerm.length>0){
                			$Searchbar.setText("");
                			fileSelector.setDirectory($Tree);
                			fileSelector.clearHistory();
                		}else{
                			//hide program
                		}                		
                	}
                }    
            });
        }
        
        //searchvalue listeners
        {
            $Searchbar.addValueListener(function(value){
                return $SelectorHandler.__searchbarChange(value);
            });
        }
        
        //right click setup
        {
            $ContextMenuHandler.setDefaultContextMenu(new ContextMenu([
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
    
    //move to fileSelector
    var cutFile;
    $Main.setCutFile = function(file){
        if(cutFile)
            $Main.resetCutFile();
        if(!file.cut)
            file.setCut(true);
        cutFile = file;
    };
    $Main.resetCutFile = function(){
        if(cutFile){
            if(cutFile.cut)
                cutFile.setCut(false);
            cutFile = null;
        }
    };
    
    return $Main;
})();