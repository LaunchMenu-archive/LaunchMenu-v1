/*global variables Class, ContextMenu, Utils, ContextMenuHandler, EventHandler*/
var ContextMenuButton = Class("ContextMenuButton", {
    const: function(icon, text, shortcut, func, children, dontCloseAfter){//you can only provide a func or children, the other must be null
        if(typeof icon == "object"){
            text = icon.text;
            shortcut = icon.shortcut;
            func = icon.func;
            children = icon.children;
            dontCloseAfter = icon.dontCloseAfter;
            icon = icon.icon;
        }
        
        var n = Utils.createTemplateElement(this.className, this.template);
        this.element = n.element;
        this.htmlClassName = n.htmlClassName;
        this.$ = n.querier;
        
        
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
        
        this.$(".text").text(text);
        if(icon)
            this.$("img").attr("src", icon);
        
        this.eventSetup();
    },
    eventSetup: function(){
        var t = this;
        this.element.click(function(){
            t.execute();
        }).mouseenter(function(){
            t.select();
        });
    },
    setContextMenu: function(contextMenu){
        this.contextMenu = contextMenu;
        if(this.subMenu)
            this.subMenu.parentMenu = contextMenu;
        EventHandler.trigger("setContextMenu:post", this, {contextMenu: contextMenu});
    },
    
    openSubMenu: function(){
        if(EventHandler.trigger("openSubMenu:pre", this, {})){
            if(this.subMenu){
                if(!this.subMenu.open())
                    return false;
                this.subMenu.setPosition(this.element);
                
                EventHandler.trigger("openSubMenu:post", this, {});
                return true;
            }
        }
        return false;
    },
    closeSubMenu: function(){
        if(EventHandler.trigger("closeSubMenu:pre", this, {})){
            if(this.subMenu){
                if(!this.subMenu.close())
                    return false;
                    
                EventHandler.trigger("closeSubMenu:post", this, {});
                return true;
            } 
        }
        return false;
    },
    select: function(){
        if(EventHandler.trigger("select:pre", this, {})){
            this.element.addClass("selected");
            var ret = false;
            if(this.contextMenu.selectButton(this)){
                this.element.addClass("bg3");
                this.openSubMenu();
                ret = true;
            }else{
                this.element.removeClass("selected");    
            }
            
            if(ret)
                EventHandler.trigger("select:post", this, {});
            return ret;
        }
        return false;
    },
    deselect: function(){
        this.element.removeClass("bg3");
        this.element.removeClass("selected");
        this.closeSubMenu();
    },
    isSelected: function(){
        return this.element.is(".selected");
    },
    
    setExecuteObject: function(obj){
        if(EventHandler.trigger("setExecuteObject:pre", this, {object:obj})){
            this.executeObj = obj;
            if(this.subMenu)
                this.subMenu.setExecuteObject(obj);
            
            EventHandler.trigger("setExecuteObject:post", this, {object:obj});
            return true;
        }
        return false;
    },
    execute: function(){
        if(EventHandler.trigger("execute:pre", this, {})){
            if(this.subMenu){
                this.subMenu.executeButton();
            }else if(this.func){
                this.func.call(this.executeObj, this.executeObj);
                if(!this.dontCloseAfter){
                    ContextMenuHandler.closeContextMenu();
                }
            }
           
            EventHandler.trigger("execute:post", this, {});
            return true;
        }
        return false;
    },
    checkShortcuts: function(shortcut){
        if(this.shortcut==shortcut){
            this.execute();
            return true;
        }
        if(this.menu)
            return this.menu.checkShortcuts(shortcut);
    },
    
    template:{
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
});