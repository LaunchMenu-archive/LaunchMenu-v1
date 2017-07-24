/*global variables Class, ContextMenu, $Utils, $ContextMenuHandler, $EventHandler*/
loadOnce("/$Utils");
loadOnce("/$EventHandler");
window.ContextMenuButton = class ContextMenuButton{
    constructor(icon, text, shortcut, func, children, dontCloseAfter){//you can only provide a func or children, the other must be null
        if(typeof icon == "object"){
            text = icon.text;
            shortcut = icon.shortcut;
            func = icon.func;
            children = icon.children;
            dontCloseAfter = icon.dontCloseAfter;
            icon = icon.icon;
        }
        this.__initVars();
        
        //create element
        var n = $Utils.createTemplateElement(this.constructor.name, this.template);
        this.element = n.element;
        this.htmlClassName = n.htmlClassName;
        this.$ = n.querier;
        
        //setup submenu or function
        if(children){
            this.subMenu = new ContextMenu(children);
        }else{
            this.func = func;
            this.dontCloseAfter = dontCloseAfter;
            if(shortcut){
                this.shortcut = shortcut.toLowerCase();
                this.$(".shortcut").text(shortcut.replace(/(\w)(\w*)/g, function(match, g1, g2){
                    return g1.toUpperCase()+g2;
                }));
            }
        }
        
        //fill in element data
        this.$(".text").text(text);
        if(icon)
            this.$("img").attr("src", icon);
        
        this.__eventSetup();
    }
    __initVars(){
    	this.template = {
            html:   `<div class=icon>
                        <img src=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII=>
                    </div>
                    <div class='f0 text'></div>
                    <div class='f6 shortcut'></div>
                    <br style=clear:both;>`,
            style:  `.root{
                        cursor: pointer;
                        position:relative;
                        height: 25px;
                        border-bottom-width: 1px;
                    }
                    .icon{
                        margin-left:5px;
                        width: 25px;
                        height: 25px;
                        float: left;
                    }
                    img{
                        padding: 2px;
                        width: 25px;
                        height: 25px;
                    }
                    .text{
                        padding-left: 5px;
                        display:inline-block;
                        float: left;
                        height: 25px;
                        line-height:25px;
                    }
                    .shortcut{
                        padding-left: 10px;
                        display:inline-block;
                        float: right;
                        height: 25px;
                        line-height:28px;
                        
                        font-size: 12px;
                        padding-right: 3px;
                        margin-right:10px;
                    }`
        }
    }
    __eventSetup(){
        var t = this;
        this.element.click(function(){
            t.execute();
        }).mouseenter(function(){
            t.select();
        });
    }
    //events that can be tapped into and altered
    __onSelect(){}				//fires when the button is selected	
    __onDeselect(){}			//fires when the button is deselected
    __onExecute(){}				//fires when the button is being executed, return true to disable the default execute behaviour
    __keyboardEvent(event){		//fires on keyboard events
    	if(this.subMenu)
    		return this.subMenu.__keyboardEvent(event);
    	return false;
    }
    __checkShortcuts(shortcut){ //fires on keyboard events, but passes a shortcut string
    	if(this.shortcut==shortcut){
    		this.execute();
    		return true;
    	}
    	if(this.subMenu)
    		return this.subMenu.__checkShortcuts(shortcut);
    }
    
    //
    __setContextMenu(contextMenu){
        this.contextMenu = contextMenu;
        if(this.subMenu)
            this.subMenu.parentMenu = contextMenu;
        $EventHandler.trigger("setContextMenu:post", this, {contextMenu: contextMenu});
    }
    
    //submenu visibitly methods
    openSubMenu(){
        if($EventHandler.trigger("openSubMenu:pre", this, {})){
            if(this.subMenu){
                if(!this.subMenu.open())
                    return false;
                this.subMenu.setPosition(this.element);
                
                $EventHandler.trigger("openSubMenu:post", this, {});
                return true;
            }
        }
        return false;
    }
    closeSubMenu(){
    	if(this.subMenu){
    		if($EventHandler.trigger("closeSubMenu:pre", this, {})){
                if(!this.subMenu.close())
                    return false;
                    
                $EventHandler.trigger("closeSubMenu:post", this, {});
                return true;
            } 
        }
        return false;
    }
    
    //select methods
    select(){
        if($EventHandler.trigger("select:pre", this, {})){
            this.element.addClass("selected");
            var ret = false;
            if(this.contextMenu.selectButton(this)){
                this.element.addClass("bg3");
                this.openSubMenu();
                ret = true;
            }else{
                this.element.removeClass("selected");    
            }
            
            if(ret){
            	this.__onSelect();
                $EventHandler.trigger("select:post", this, {});
            }
            return ret;
        }
        return false;
    }
    deselect(){
        this.element.removeClass("bg3");
        this.element.removeClass("selected");
        this.closeSubMenu();
        this.__onDeselect();
    }
    isSelected(){
        return this.element.is(".selected");
    }
    
    //execute methods
    setExecuteObject(obj){//set the object to execute the execute function on
        if($EventHandler.trigger("setExecuteObject:pre", this, {object:obj})){
            this.executeObj = obj;
            if(this.subMenu)
                this.subMenu.setExecuteObject(obj);
            
            $EventHandler.trigger("setExecuteObject:post", this, {object:obj});
            return true;
        }
        return false;
    }
    execute(){
        if($EventHandler.trigger("execute:pre", this, {})){
        	if(!this.__onExecute()){
        		if(this.subMenu){
        			this.subMenu.executeButton();
        		}else if(this.func){
        			this.func.call(this.executeObj, this.executeObj);
        			if(!this.dontCloseAfter){
        				$ContextMenuHandler.__closeContextMenu();
        			}
        		}
        		
        		$EventHandler.trigger("execute:post", this, {});
        		return true;        		
        	}
        }
        return false;
    }
}