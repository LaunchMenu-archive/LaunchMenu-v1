/*global variables Class, Menu, Main, ContextMenu, ContextMenuHandler */
var ActionMenu = Class("ActionMenu",{
    /*actions as an array with objects with the following data:
    {
        icon: "imgUrl",
        text: "action name",
        menuHidden: boolean,            *optional,  defaults to false*
        contextMenuHidden: boolean,     *optional,  defaults to false*
        children: actions array,        *           sub list of actions*
        func: function,                 *           the function to execute*
        shortcut: "ctrl+s"              *optional,  a shortcut for the action*
    }
    you can not both define children and func*/
    const: function(actions){
        if(actions){
            this.super.const(actions);
            this.contextMenu = new ContextMenu(actions);
        }else{
            this.super.const();
        }
    },
    closeable: true,
    extensions: [],
    openFileItem: function(fileItem){
        this.setExecuteObject(fileItem);
        this.open();
    },
    openContextMenu: function(fileItem, offset){
        if(this.contextMenu){
            offset = ContextMenuHandler.getRelativeOffset(offset);
            this.contextMenu.setExecuteObject(fileItem);
            this.contextMenu.open();
            this.contextMenu.setPosition(offset.left, offset.top);
        }
    },
    
    
    executeFile: function(file){ //the function that runs when a file is being executed
        
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