/*global variables Class, ActionMenu, ActionMenuHandler, Main, Searchbar, ActionMenuStandard*/
var ActionMenuDirectory = Class("ActionMenuDirectory",{
    const: function(){
        this.super.const(ActionMenuDirectory.actions);
    },
    actions: [
        {
            icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA",
            text: "Shit",
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
                    text: "Shit",
                    shortcut: "Ctrl+s",
                    func: function(){
                        console.log(this, "shit");
                        return true;
                    }
                }
            ]
        }
    ],
    directory: true,
    onExecuteFile: function(directory){
        Main.fileSelector.setDirectory(directory);
        Searchbar.clear();
        return true;
    }
}, ActionMenuStandard);
ActionMenuHandler.registerActionMenuType(new ActionMenuDirectory());