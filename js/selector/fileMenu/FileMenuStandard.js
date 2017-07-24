/*global variables Class, FileMenu, $FileMenuHandler, $Main, $Searchbar*/
(function(){
	var defActions = [
        null,
        {
            text: "Copy",
            shortcut: "Ctrl+C",
            menuHidden: true,
            func: function(){
                console.log(this, "copy");
                return true;
            }
        },{
            text: "Cut",
            shortcut: "Ctrl+X",
            menuHidden: true,
            func: function(){
                console.log(this, "cut");
                $Main.resetCutFile();
                this.setCut(true);
                return true;
            }
        },{
            text: "Paste",
            shortcut: "Ctrl+V",
            menuHidden: true,
            func: function(){
                console.log(this, "paste");
                return true;
            }
        }
    ];
	
	loadOnce("FileMenu");
	window.FileMenuStandard = class FileMenuStandard extends FileMenu{
	    constructor(actions){
	        if(actions && actions instanceof Array){
	            super(actions.concat(defActions));
	        }else{
	            super(defActions);
	        }
	    }   
	}
})();