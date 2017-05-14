/*global variables Class, ActionMenu, ActionMenuHandler, Main, Searchbar*/
var ActionMenuStandard = Class("ActionMenuStandard",{
    const: function(actions){
        if(actions && actions instanceof Array){
            this.super.const(actions.concat(ActionMenuStandard.actions));
        }else{
            this.super.const(ActionMenuStandard.actions);
        }
    },
    actions:[
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
                Main.resetCutFile();
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
    ]
}, ActionMenu);