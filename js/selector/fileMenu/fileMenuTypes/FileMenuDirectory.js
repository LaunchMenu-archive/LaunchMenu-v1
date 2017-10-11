/*global variables Class, FileMenu, $FileMenuHandler, $Main, $Searchbar, FileMenuStandard*/
(function(){
    var defActions = [
        {
            icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA",
            text: "something",
            shortcut: "Ctrl+s",
            func: function(){
                console.log(this, "shit");
                return true;
            }
        },{
            text:"stuff",
            children:[
                {
                    icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA",
                    text: "something",
                    shortcut: "Ctrl+p",
                    func: function(){
                        console.log(this, "shit");
                        return true;
                    }
                }
            ]
        }
    ]; 
    loadOnce("../FileMenuStandard");
    $FileMenuHandler.registerFileMenuType(
        class FileMenuDirectory extends FileMenuStandard{
            constructor(){
                super(defActions);
            }
            __initVars(){
                super.__initVars();
                
                this.directory = true;
            }
            __onExecuteFile(directory){
                $Main.fileSelector.setDirectory(directory);
                $Searchbar.clear();
                return true;
            }
        }
    );
})();