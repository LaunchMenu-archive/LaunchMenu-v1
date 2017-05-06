/*global variables Class, Menu */
var ActionMenu = Class("ActionMenu",{
    const: function(){
        this.super.const();
        
        this.shortcuts = [];
        
        var actions = this.standardActions.concat(this.actions);
        for(var i=0; i<actions.length; i++){
            var action = actions[i];
            if(!action.hidden)
                this.addItem(action.icon, action.text, action.func);
            
        }
    },
    extensions: [],
    standardActions:[
        {
            icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA",
            text: "Copy",
            shortcut: "Ctrl+C",
            hidden: true,
            func: function(){
                console.log(this.file, "copy");
            }
        },{
            icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA",
            text: "Cut",
            shortcut: "Ctrl+X",
            func: function(){
                console.log(this.file, "cut");
            }
        },{
            icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA",
            text: "Paste",
            shortcut: "Ctrl+V",
            hidden: true,
            func: function(){
                console.log(this.file, "paste");
            }
        }
    ],
    actions:[],
    openFile: function(file){
        this.file = file;
        this.open();
    },
    executeFile: function(file){
        
    },
    
    keyboardEvent: function(event){
        if(event.key=="Tab"){
            if(event.shiftKey){
                this.close();
            }
            return true;
        }
        return this.super.keyboardEvent(event);
    }, 
    executeItem: function(){ //execute the currently selected item
        if(this.selectedItem){
            if(!this.selectedItem.execute()){
                var t = this;
                setTimeout(function(){
                    t.close();
                },70);
            }
        }
    },
    headerTemplate:{
        html:`  <div class='bd3 bg1 actionHeader'>
                    <div class=actionIcon>
                        <img class=actionImage src='../resources/images/icons/actions icon.png'>
                    </div>
                    <div class='actionTitle'>
    					<div class='f0 actionTitleInner'>Actions</div>
    				</div>
    				<br style=clear:both>
                </div>`,
        style:  `.actionHeader{
                    height:60px;
                    width: 100%;
                    border-bottom-width:1px;
                }
                .actionIcon{
                    float: left;
                    width: 60px;
                    height: 60px;
                }
                .actionImage{
                    padding: 4px;
                    width: 100%;
                    height: 100%;
                }
                .actionTitle{
                    float: right;
                    width: calc(100% - 60px);
                    height: 100%;
                }
                .actionTitleInner{
                    position: relative;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding-left: 10px;
                    font-size: 30px;
                    width: 100%;
                }`
    },
},Menu);