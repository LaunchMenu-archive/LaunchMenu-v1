/*global variables Class, $Utils, ContextMenuButton, $ContextMenuHandler, $EventHandler*/
loadOnce("$ContextMenuHandler");
loadOnce("ContextMenuButton");
loadOnce("/$Utils");
loadOnce("/$EventHandler");
window.ContextMenu = class ContextMenu{
	/*buttonData as an array with objects with the following data:
    {
        icon: "imgUrl",
        text: "action name",
        contextMenuHidden: boolean,     (optional,  defaults to false)
        children: actions array,        (           sub list of actions)
        func: function,                 (           the function to execute)
        shortcut: "ctrl+s"              (optional,  a shortcut for the action)
    }
    you can not both define children and func*/
    constructor(buttonData){
    	this.__initVars();
    	
        if(buttonData==null) buttonData = this.items;
        
        var n = $Utils.createTemplateElement(this.constructor.name, this.template);
        this.element = n.element;
        this.htmlClassName = n.htmlClassName;
        this.$ = n.querier;
        
        this.buttons = [];
        this.insertButtons(buttonData);
        
        //the direction in which submenus are opened
        this.openRight = true;
        this.openDown = true;
    }
    __initVars(){
        this.dividerTemplate = {
            html:   `<div class='bd3 divider'></div>`,  
            style:  `.divider{
                        margin: 5px;
                        border-bottom-width: 1px;
                    }`
        };
        this.template = {
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
        };
        this.items = [];
    }
    
    //events that can be tapped into and altered
    __onClose(){}   		    //fires when the context menu is closed
    __onOpen(){}			    //fires when the context menu is opened
    __keyboardEvent(event){     //fires on keyboard events
        if(this.selectedButton){
            if(this.selectedButton.subMenu)
                if(this.selectedButton.subMenu.__keyboardEvent(event))
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
    }
    __checkShortcuts(shortcut){ //fires on keyboard events, but passes a shortcut string
        for(var i=0; i<this.buttons.length; i++){
            var button = this.buttons[i];
            if(button.__checkShortcuts(shortcut))
                return true;
        }
        return false;
    }
    
    //button insertion code
    insertButtons(buttonData){
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
    }
    addButton(contextMenuButton){
        this.buttons.push(contextMenuButton);
        this.$(".buttons").append(contextMenuButton.element);  
        contextMenuButton.__setContextMenu(this);
    }
    addDivider(){
        var n = $Utils.createTemplateElement("ContextMenuDivider", this.dividerTemplate);
        this.$(".buttons").append(n.element);
    }
    
    //visibility methods
    open(){
        if($EventHandler.trigger("open:pre", this, {})){
            if(!this.opened){
                this.opened = $ContextMenuHandler.__setOpenedContextMenu(this);
                
                if(this.opened){                	
                	this.__onOpen();
                	$EventHandler.trigger("open:post", this, {});
                	return true;
                }
            }
        }
        return false;
    }
    close(){
        if($EventHandler.trigger("close:pre", this, {})){
            var wasOpened = this.opened;
            this.opened = false;
            if(wasOpened){
                $ContextMenuHandler.__closeContextMenu(this);
                this.selectButton(null);
                
                this.__onClose();
                $EventHandler.trigger("close:post", this, {});
                return true;
            }
        }
        return false;
    }
    isOpened(){
        return this.opened;  
    }
    isSelected(){
        return this.selectedButton!=null;  
    }
    
    setPosition(left, top){
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
            var off = $ContextMenuHandler.getElementOffset(buttonEl);
            
            //decide to open menu left or right
            var containerWidth = $ContextMenuHandler.getContainerWidth();
            var leftOff = this.openRight?buttonEl.width():-this.element.width();
            this.element.css("left", off.left+leftOff);
            var elOff = $ContextMenuHandler.getElementOffset(this.element);
            if(elOff.left+elWidth>containerWidth-p || elOff.left<p){
                this.openRight = !this.openRight;
                leftOff = this.openRight?buttonEl.width():-elWidth;
                this.element.css("left", off.left+leftOff);
            }
            
            //decide to open menu up or down
            var containerHeight = $ContextMenuHandler.getContainerHeight();
            var topOff = this.openDown?-6:-this.element.height()+buttonEl.height()+6;
            this.element.css("top", off.top+topOff);
            var elOff = $ContextMenuHandler.getElementOffset(this.element);
            if(elOff.top+elHeight>containerHeight-p || elOff.top<p){
                this.openDown = !this.openDown;
                var topOff = this.openDown?-6:-elHeight+buttonEl.height()+6;
                this.element.css("top", off.top+topOff);
            }
            
        }else{
            this.element.css({"left":left, "top":top});
            
            var containerWidth = $ContextMenuHandler.getContainerWidth();
            var containerHeight = $ContextMenuHandler.getContainerHeight();
            
            var elOff = $ContextMenuHandler.getElementOffset(this.element);
            if(elOff.left+this.element.width()>containerWidth-p)
                this.element.css("left",left-this.element.width());    
            if(elOff.top+this.element.height()>containerHeight-p)
                this.element.css("top",top-this.element.height());    
        }
        
        //if menu doesn't fit up nor down, snap to closest border
        var elOff = $ContextMenuHandler.getElementOffset(this.element);
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
    }
    
    //button interaction code
    selectButton(contextMenuButton){
        if(this.selectedButton==contextMenuButton)
            return true;
        if($EventHandler.trigger("selectButton:pre", this, {contextMenuButton:contextMenuButton})){
            var prevButton = this.selectedButton;
            this.selectedButton = contextMenuButton;
            if(contextMenuButton && !this.selectedButton.isSelected())
                if(!this.selectedButton.select()){
                    this.selectedButton = prevButton;
                    return false;
                }
            if(prevButton)
                prevButton.deselect();
                
            $EventHandler.trigger("selectButton:post", this, {contextMenuButton:contextMenuButton});
            return true;
        }
        return false;
    }
    selectDown(){
        var index = this.buttons.indexOf(this.selectedButton);
        var button;
        if(index+1<this.buttons.length)
            button = this.buttons[index+1];
        
        if(button)    
            if($EventHandler.trigger("selectDown:pre", this, {currentSelected:this.selectedButton, button:button})){
                this.selectButton(button);
                    
                $EventHandler.trigger("selectDown:post", this, {currentSelected:this.selectedButton});
                return true;
            }
        return false;
    }
    selectUp(){
        var index = this.buttons.indexOf(this.selectedButton);
        var button;
        if(index==-1 && this.buttons.length>0)
            button = this.buttons[0];
        else if(index-1>=0)
            button = this.buttons[index-1];
        
        if(button)
            if($EventHandler.trigger("selectUp:pre", this, {currentSelected:this.selectedButton, button:button})){
                this.selectButton(button);
                    
                $EventHandler.trigger("selectUp:post", this, {currentSelected:this.selectedButton});
                return true;
            }
        return false;
    }
    selectSubMenu(){
        if(this.selectedButton){
            var menu = this.selectedButton.subMenu;
            if(menu){
                if($EventHandler.trigger("selectSubMenu:pre", this, {menu:menu})){
                    var buttons = menu.buttons;
                    if(buttons.length>0)
                        menu.selectButton(buttons[0]);
                        
                    $EventHandler.trigger("selectSubMenu:post", this, {menu:menu});
                    return true;
                }
            }
        }
        return false;
    }
    deselect(){
        if($EventHandler.trigger("deselect:pre", this, {})){
            if(this.parentMenu)
                this.selectButton(null);
                
            $EventHandler.trigger("deselect:post", this, {});
            return true;  
        }
        return false;
    }

    setExecuteObject(obj){ //set the object that all the functions will be executed on
        if($EventHandler.trigger("setExecuteObject:pre", this, {object: obj})){
            for(var i=0; i<this.buttons.length; i++){
                var button = this.buttons[i];
                button.setExecuteObject(obj);
            }
            
            $EventHandler.trigger("setExecuteObject:post", this, {object: obj});
            return true;
        }
        return false;
    }
    executeButton(){
        if(this.selectedButton){
            if($EventHandler.trigger("executeButton:pre", this, {button: this.selectedButton})){
                if(!this.selectedButton.execute())
                    return false;
                
                $EventHandler.trigger("executeButton:post", this, {button: this.selectedButton});
                return true;
            }
        }
        return false;
    }
}