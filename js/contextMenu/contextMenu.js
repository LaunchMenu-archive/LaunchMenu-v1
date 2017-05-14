/*global variables Class, Utils, ContextMenuButton*/
var ContextMenu = Class("ContextMenu",{
    const: function(buttonData){
        if(buttonData==null) buttonData = this.items;
        
        var n = Utils.createTemplateElement(this.className, this.template);
        this.element = n.element;
        this.htmlClassName = n.htmlClassName;
        this.$ = n.querier;
        
        this.buttons = [];
        this.insertButtons(buttonData);
        
        //the direction in which submenus are opened
        this.openRight = true;
        this.openDown = true;
    },
    insertButtons: function(buttonData){
        var insertDivider = false;
        var first = true;
        for(var i=0; i<buttonData.length; i++){
            var buttonDat = buttonData[i];
            if(buttonDat){
                if(!buttonDat.contextMenuHidden){
                    //insert divider
                    if(insertDivider){
                        if(!first)
                            this.addDivider();
                        insertDivider = false;
                    }
                    
                    //insert button
                    var button = new ContextMenuButton(buttonDat);
                    this.addButton(button);
                    first = false;
                }
            }else{
                insertDivider = true;
            }
        }
    },
    addButton: function(contextMenuButton){
        this.buttons.push(contextMenuButton);
        this.$(".buttons").append(contextMenuButton.element);  
        contextMenuButton.setContextMenu(this);
    },
    addDivider: function(){
        var n = Utils.createTemplateElement("ContextMenuDivider", this.dividerTemplate);
        this.$(".buttons").append(n.element);
    },
    
    open: function(){
        if(!this.opened){
            this.opened = true;
            ContextMenuHandler.setOpenedContextMenu(this);
        }
    },
    close: function(){
        var wasOpened = this.opened;
        this.opened = false;
        if(wasOpened){
            ContextMenuHandler.closeContextMenu(this);
            this.selectButton(null);
        }
    },
    isOpened: function(){
        return this.opened;  
    },
    setPosition: function(left, top){
        var p = 5;  //padding
        var elWidth = this.element.outerWidth(true); //store before width has been collapsed by edge
        var elHeight = this.element.outerHeight(true);
        if(typeof left == "object"){
            if(this.element.parent.length==0)
                throw Error("this function can only be called when menu is already opened");
            if(this.parentMenu){
                this.openRight = this.parentMenu.openRight;
                this.openDown = this.parentMenu.openDown;
            }
            var buttonEl = left;
            var off = ContextMenuHandler.getElementOffset(buttonEl);
            
            //decide to open menu left or right
            var containerWidth = ContextMenuHandler.getContainerWidth();
            var leftOff = this.openRight?buttonEl.width():-this.element.width();
            this.element.css("left", off.left+leftOff);
            var elOff = ContextMenuHandler.getElementOffset(this.element);
            if(elOff.left+elWidth>containerWidth-p || elOff.left<p){
                this.openRight = !this.openRight;
                leftOff = this.openRight?buttonEl.width():-elWidth;
                this.element.css("left", off.left+leftOff);
            }
            
            //decide to open menu up or down
            var containerHeight = ContextMenuHandler.getContainerHeight();
            var topOff = this.openDown?-6:-this.element.height()+buttonEl.height()+6;
            this.element.css("top", off.top+topOff);
            var elOff = ContextMenuHandler.getElementOffset(this.element);
            if(elOff.top+elHeight>containerHeight-p || elOff.top<p){
                this.openDown = !this.openDown;
                var topOff = this.openDown?-6:-elHeight+buttonEl.height()+6;
                this.element.css("top", off.top+topOff);
            }
            
        }else{
            this.element.css({"left":left, "top":top});
            
            var containerWidth = ContextMenuHandler.getContainerWidth();
            var containerHeight = ContextMenuHandler.getContainerHeight();
            
            var elOff = ContextMenuHandler.getElementOffset(this.element);
            if(elOff.left+this.element.width()>containerWidth-p)
                this.element.css("left",left-this.element.width());    
            if(elOff.top+this.element.height()>containerHeight-p)
                this.element.css("top",top-this.element.height());    
        }
        
        //if menu doesn't fit up nor down, snap to closest border
        var elOff = ContextMenuHandler.getElementOffset(this.element);
        if(elOff.top+elHeight>containerHeight-p){
            this.element.css("top", containerHeight-p-elHeight);
        }else if(elOff.top<p){
            this.element.css("top", p);
        }
        
        if(elOff.left+elWidth>containerWidth-p){
            this.element.css("left", containerWidth-p-elWidth);
        }else if(elOff.left<p){
            this.element.css("left", p);
        }
    },
    
    selectButton: function(contextMenuButton){
        if(this.selectedButton!=contextMenuButton){
            if(this.selectedButton)
                this.selectedButton.deselect();
            this.selectedButton = contextMenuButton;
            if(contextMenuButton && !contextMenuButton.isSelected())
                contextMenuButton.select();
        }
    },
    selectDown: function(){
        var index = this.buttons.indexOf(this.selectedButton);
        if(index+1<this.buttons.length)
            this.selectButton(this.buttons[index+1]);
        return true;
    },
    selectUp: function(){
        var index = this.buttons.indexOf(this.selectedButton);
        if(index==-1 && this.buttons.length>0)
            this.selectButton(this.buttons[0]);
        else if(index-1>=0)
            this.selectButton(this.buttons[index-1]);
        return true;
    },
    selectSubMenu: function(){
        if(this.selectedButton){
            var menu = this.selectedButton.subMenu;
            if(menu){
                var buttons = menu.buttons;
                if(buttons.length>0)
                    menu.selectButton(buttons[0]);
            }
        }
        return true;
    },
    deselect: function(){
        if(this.parentMenu)
            this.selectButton(null);
        return true;  
    },
    isSelected: function(){
        return this.selectedButton!=null;  
    },
    setExecuteObject: function(obj){
        for(var i=0; i<this.buttons.length; i++){
            var button = this.buttons[i];
            button.setExecuteObject(obj);
        }
    },
    executeButton: function(){
        if(this.selectedButton){
            this.selectedButton.execute();
        }
        return true;
    },
    keyboardEvent: function(event){
        if(this.selectedButton){
            if(this.selectedButton.subMenu)
                if(this.selectedButton.subMenu.keyboardEvent(event))
                    return true;
                    
        }
        if(this.isSelected()){
            if(event.key=="ArrowUp"){
                return this.selectUp();
            }else if(event.key=="ArrowDown"){
                return this.selectDown();
            }else if(event.key=="ArrowLeft"){
                return this.deselect();
            }else if(event.key=="ArrowRight"){
                return this.selectSubMenu();
            }else if(event.key=="Enter"){
                return this.executeButton();
            }
        }
    },
    
    checkShortcuts: function(shortcut){
        for(var i=0; i<this.buttons.length; i++){
            var button = this.buttons[i];
            if(button.checkShortcuts(shortcut))
                return true;
        }
        return false;
    },
    
    dividerTemplate:{
        html:   `<div class='bd3 divider'></div>`,  
        style:  `.divider{
                    margin: 5px;
                    border-bottom-width: 1px;
                }`
    },
    template:{
        html:   `<div class='bg0 bd3 buttons'>
                </div>`,  
        style:  `.root{
                    position:absolute;
                }
                .buttons{
                    display: inline-block;
                    min-width: 100px;
                    padding-top: 5px;
                    padding-bottom: 5px;
                    border-width: 1px;
                }`
    },
    items:[
        {
            icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA",
            text: "Copy",
            shortcut: "Ctrl+C",
            hidden: true,
            func: function(){
                console.log(this, "copy");
                return true;
            }
        },{
            text: "Advanced",
            shortcut: "Ctrl+X",
            hidden: true,
            children:[
                {
                    text: "c1",
                    shortcut: "Ctrl+X",
                    hidden: true,
                    children:[
                        {
                            text: "c1",
                            shortcut: "Ctrl+X",
                            hidden: true,
                            children:[
                                {
                                    text: "c1",
                                    shortcut: "Ctrl+X",
                                    hidden: true,
                                    children:[
                                        {
                                            text: "c1",
                                            shortcut: "Ctrl+X",
                                            hidden: true,
                                            children:[
                                                {
                                                    text: "c1",
                                                    shortcut: "Ctrl+X",
                                                    hidden: true,
                                                    children:[
                                                        {
                                                            text: "c1",
                                                            shortcut: "Ctrl+X",
                                                            hidden: true,
                                                            children:[
                                                                {
                                                                    text: "c1",
                                                                    shortcut: "Ctrl+X",
                                                                    hidden: true,
                                                                    children:[
                                                                        {
                                                                            text: "c1",
                                                                            shortcut: "Ctrl+X",
                                                                            hidden: true,
                                                                            children:[
                                                                                {
                                                                                    text: "c1",
                                                                                    shortcut: "Ctrl+X",
                                                                                    hidden: true,
                                                                                    func: function(){
                                                                                        console.log("do shit");
                                                                                        return true;
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },{
                    text: "c2",
                    shortcut: "Ctrl+V",
                    hidden: true,
                    func: function(){
                        console.log(this, "c2");
                        return true;
                    },
                    dontCloseAfter: true
                },{
                    text: "c3",
                    shortcut: "Ctrl+Shit",
                    hidden: true,
                    func: function(){
                        console.log(this, "c3");
                        return true;
                    }
                },{
                    text: "c4",
                    shortcut: "Ctrl+V",
                    hidden: true,
                    func: function(){
                        console.log(this, "c2");
                        return true;
                    }
                },{
                    text: "c5",
                    shortcut: "Ctrl+Shit",
                    hidden: true,
                    func: function(){
                        console.log(this, "c3");
                        return true;
                    }
                },{
                    text: "c6",
                    shortcut: "Ctrl+V",
                    hidden: true,
                    func: function(){
                        console.log(this, "c2");
                        return true;
                    }
                },{
                    text: "c7",
                    shortcut: "Ctrl+Shit",
                    hidden: true,
                    func: function(){
                        console.log(this, "c3");
                        return true;
                    }
                },{
                    text: "c8",
                    shortcut: "Ctrl+V",
                    hidden: true,
                    func: function(){
                        console.log(this, "c2");
                        return true;
                    }
                },{
                    text: "c9",
                    shortcut: "Ctrl+Shit",
                    hidden: true,
                    func: function(){
                        console.log(this, "c3");
                        return true;
                    }
                },{
                    text: "c10",
                    shortcut: "Ctrl+V",
                    hidden: true,
                    func: function(){
                        console.log(this, "c2");
                        return true;
                    }
                },{
                    text: "c11",
                    shortcut: "Ctrl+Shit",
                    hidden: true,
                    func: function(){
                        console.log(this, "c3");
                        return true;
                    }
                }
            ]
        },
        null,
        {
            text: "Paste",
            shortcut: "Ctrl+V",
            hidden: true,
            func: function(){
                console.log(this, "paste");
                return true;
            }
        }
    ]
});