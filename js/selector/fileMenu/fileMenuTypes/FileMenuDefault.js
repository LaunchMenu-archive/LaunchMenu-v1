/*global variables Class, FileMenu, $FileMenuHandler, fileSelector, $Searchbar, FileMenuStandard*/
(function(){
    var defActions = []
    loadOnce("../FileMenuStandard");
    $FileMenuHandler.registerFileMenuType(
        class FileMenuDefault extends FileMenuStandard{
            constructor(){
                super(defActions);
            }
            __initVars(){
                super.__initVars();
                this.default = true;    
            }
            onExecuteFile(file){
                console.log("execute",file);
                return true;
            }
        }
    );
})();
