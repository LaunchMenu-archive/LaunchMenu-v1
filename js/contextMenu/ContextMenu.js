/*global variables Class, Utils, ContextMenuButton, ContextMenuHandler, EventHandler*/
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
        if(EventHandler.trigger("open:pre", this, {})){
            if(!this.opened){
                this.opened = true;
                ContextMenuHandler.setOpenedContextMenu(this);
                
                EventHandler.trigger("open:post", this, {});
                return true;
            }
        }
        return false;
    },
    close: function(){
        if(EventHandler.trigger("close:pre", this, {})){
            var wasOpened = this.opened;
            this.opened = false;
            if(wasOpened){
                ContextMenuHandler.closeContextMenu(this);
                this.selectButton(null);
                
                EventHandler.trigger("close:post", this, {});
                return true;
            }
        }
        return false;
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
        if(this.selectedButton==contextMenuButton)
            return true;
        if(EventHandler.trigger("selectButton:pre", this, {contextMenuButton:contextMenuButton})){
            var prevButton = this.selectedButton;
            this.selectedButton = contextMenuButton;
            if(contextMenuButton && !this.selectedButton.isSelected())
                if(!this.selectedButton.select()){
                    this.selectedButton = prevButton;
                    return false;
                }
            if(prevButton)
                prevButton.deselect();
                
            EventHandler.trigger("selectButton:post", this, {contextMenuButton:contextMenuButton});
            return true;
        }
        return false;
    },
    selectDown: function(){
        var index = this.buttons.indexOf(this.selectedButton);
        var button;
        if(index+1<this.buttons.length)
            button = this.buttons[index+1];
        
        if(button)    
            if(EventHandler.trigger("selectDown:pre", this, {currentSelected:this.selectedButton, button:button})){
                this.selectButton(button);
                    
                EventHandler.trigger("selectDown:post", this, {currentSelected:this.selectedButton});
                return true;
            }
        return false;
    },
    selectUp: function(){
        var index = this.buttons.indexOf(this.selectedButton);
        var button;
        if(index==-1 && this.buttons.length>0)
            button = this.buttons[0];
        else if(index-1>=0)
            button = this.buttons[index-1];
        
        if(button)
            if(EventHandler.trigger("selectUp:pre", this, {currentSelected:this.selectedButton, button:button})){
                this.selectButton(button);
                    
                EventHandler.trigger("selectUp:post", this, {currentSelected:this.selectedButton});
                return true;
            }
        return false;
    },
    selectSubMenu: function(){
        if(this.selectedButton){
            var menu = this.selectedButton.subMenu;
            if(menu){
                if(EventHandler.trigger("selectSubMenu:pre", this, {menu:menu})){
                    var buttons = menu.buttons;
                    if(buttons.length>0)
                        menu.selectButton(buttons[0]);
                        
                    EventHandler.trigger("selectSubMenu:post", this, {menu:menu});
                    return true;
                }
            }
        }
        return false;
    },
    deselect: function(){
        if(EventHandler.trigger("deselect:pre", this, {})){
            if(this.parentMenu)
                this.selectButton(null);
                
            EventHandler.trigger("deselect:post", this, {});
            return true;  
        }
        return false;
    },
    isSelected: function(){
        return this.selectedButton!=null;  
    },
    setExecuteObject: function(obj){
        if(EventHandler.trigger("setExecuteObject:pre", this, {object: obj})){
            for(var i=0; i<this.buttons.length; i++){
                var button = this.buttons[i];
                button.setExecuteObject(obj);
            }
            
            EventHandler.trigger("setExecuteObject:post", this, {object: obj});
            return true;
        }
        return false;
    },
    executeButton: function(){
        if(this.selectedButton){
            if(EventHandler.trigger("executeButton:pre", this, {button: this.selectedButton})){
                if(!this.selectedButton.execute())
                    return false;
                
                EventHandler.trigger("executeButton:post", this, {button: this.selectedButton});
                return true;
            }
        }
        return false;
    },
    keyboardEvent: function(event){
        if(this.selectedButton){
            if(this.selectedButton.subMenu)
                if(this.selectedButton.subMenu.keyboardEvent(event))
                    return true;
                    
        }
        if(this.isSelected()){
            if(event.key=="ArrowUp"){
                this.selectUp();
                return true;
            }else if(event.key=="ArrowDown"){
                 this.selectDown();
                return true;
            }else if(event.key=="ArrowLeft"){
                this.deselect();
                return true;
            }else if(event.key=="ArrowRight"){
                this.selectSubMenu();
                return true;
            }else if(event.key=="Enter"){
                this.executeButton();
                return true;
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
    items:[]
});