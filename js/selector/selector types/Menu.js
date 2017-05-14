/*global variables Class, Utils, Selector, SelectorItem, Searchbar, Querier*/
var Menu = Class("Menu",{
    const: function(buttons){
        this.super.const();
        if(buttons){
            this.insertButtons(buttons);    
        }
    },
    insertButtons: function(buttons){
        var insertDivider = false;
        var first = true;
        for(var i=0; i<buttons.length; i++){
            var buttonItem = buttons[i];
            if(buttonItem){
                if(!buttonItem.menuHidden){
                    //insert divider
                    if(insertDivider){
                        insertDivider = false;
                        if(!first)
                            this.insertItemElement(`
                                <div class='bd3 bg1 divider _MenuDivider_' style='width:100%; height:20px; border-bottom-width:1px'>
                                </div>
                            `);
                    }
                    
                    //insert button    
                    var button = new MenuButton(buttonItem);
                    this.addItem(button);
                    first = false;
                }
            }else{
                insertDivider = true;
            }
        }
    },
    closeable: false, //if menu is closable using shift+tab
    onOpen: function(){
        Searchbar.clear(true);
        this.searchbarChange("");
        if(this.selectorItems.length>0)
            this.selectorItems[0].select();
    },
    onClose: function(){}, //don't restroy on close
    setParentMenu: function(menu){
        this.parentMenu = menu;
    },
    
    leaveShortcut: "shift+tab",
    enterShortcut: "tab",
    keyboardEvent: function(event){
        var shortcut = Utils.keyboardEventToShortcut(event);
        if(shortcut==this.enterShortcut){
            if(this.selectedItem && this.selectedItem.subMenu){
                this.selectedItem.execute();
                return true;
            }
        }else if(shortcut==this.leaveShortcut){
            if(this.parentMenu){
                this.parentMenu.open();
            }else if(this.closeable){
                this.close();
            }
            return true;
        }
        return this.super.keyboardEvent(event);
    }, 
    searchbarChange: function(value){
        for(var i=0; i<this.selectorItems.length; i++){
            this.selectorItems[i].element.hide();
        }
        
        //query for matches
        var matches;
        var regexSearch = false;
        if(/\/(.+)\/(\w*)/.test(value)){
            matches = Querier.regexQueryList(value, this.selectorItems, function(){
                return this.text;
            });
            regexSearch = true;
        }else{
            matches = Querier.queryList(value, this.selectorItems, function(){
                return this.text;
            }, 1);
        }
        
        if(!(matches instanceof Array) || matches.length==0){
            this.$(".messageOuter").show();
            if(!(matches instanceof Array)){
                this.$(".noActionsMessage").hide();
                this.$(".regexErrorMessage").show();
                this.$(".regexError").text(matches.message);
            }else{
                this.$(".noActionsMessage").show();
                this.$(".regexErrorMessage").hide();
            }
        }else{
            this.$(".messageOuter").hide();
            
            //show matches
            Querier.prepare(value);
            for(var i=0; i<matches.length; i++){
                var menuItem = matches[i].item;
                menuItem.highlight(matches[i].match.type);
                menuItem.element.show();
            }
            if(!this.selectedItem.element.is(":visible") && matches.length>0)
                matches[0].item.select();
            this.$(".list").scrollbar("reset");
        }
    },
    setExecuteObject: function(obj){
        for(var i=0; i<this.selectorItems.length; i++){
            var item = this.selectorItems[i];
            if(item.setExecuteObject)
                item.setExecuteObject(obj);
        }
    },
    template:{ //template for the main structure of the selector
        html:  `<div class='bg0 wrapper'>
                    <div class=header>_HEADER_</div>
                    <div class=list>_LIST_</div>
                    <div class=footer>_FOOTER_</div>
                    <div class=messageOuter style=display:none>
                        <div class=message>
    						<span class='noActionsMessage' style=display:none>
								No actions could be found Mother Fucker.
    						</span>
    						<span class='regexErrorMessage' style=display:none>
    							No actions could be found Mother Fucker.
								<span class='fontError regexError'>
									
								</span>
    						</span>
                        </div>
                    </div>
                </div>`,
        style:` .wrapper,
                .list{
                    width: 100%;
                    height:100%;
                }
                .wrapper{
                    float: right;
                    position: relative;
                }
                .messageOuter{
                    position: absolute;
                    top: 0%;
                    height: 100%;
                    width: 100%;
                }
                .message{
                    padding: 10px;
                    text-align: center;
                    position: relative;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }`
    },
},Selector);
var MenuButton = Class("MenuButton",{
    const: function(icon, text, shortcut, func, children, dontCloseAfter){//you can only provide a func or children, the other must be null
        if(typeof icon == "object"){
            text = icon.text;
            shortcut = icon.shortcut;
            func = icon.func;
            children = icon.children;
            dontCloseAfter = icon.dontCloseAfter;
            icon = icon.icon;
        }
        
        this.super.const();
        
        if(children){
            this.subMenu = new Menu(children);
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
        
        this.text = text||"";
        this.$(".textInner").text(text);
        if(icon)
            this.$("img").attr("src", icon);
    },
    setSelector: function(menu){
        this.selector = menu;
        if(this.subMenu){
            this.subMenu.setParentMenu(menu);
            this.subMenu.closeable = menu.closeable;
        }
    },
    highlight: function(type){
        if(type){
            this.$(".textInner").html(type.highlight(this.text, this.htmlClassName+" backgroundHighlight0"));
        }else{
            this.$(".textInner").text(this.text);
        }
    },
    setExecuteObject: function(obj){
        this.executeObj = obj;
        if(this.subMenu)
            this.subMenu.setExecuteObject(obj);
    },
    execute: function(){
        if(this.subMenu){
            this.subMenu.open();
            return true;
        }else if(this.func){
            var val = this.func.call(this.executeObj, this.executeObj);
            if(!this.dontCloseAfter)
                if(this.selector.closeable)
                    this.selector.close();
                else if(this.selector.parentMenu)
                    this.selector.parentMenu.open();
            return val;
        }
    },
    template:{
        html:   `<div class=icon>
                    <img src=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII=>
                </div>
                <div class='f0 text'>
                    <div class=textInner></div>
                </div>
                <div class='f6 shortcut'>
                
                </div>
                <br style=clear:both;>`,
        style:  `.root{
                    position:relative;
                    min-height: 40px;
                    width: 100%;
                    border-bottom-width: 1px;
                }
                .icon{
                    width: 40px;
                    height: 40px;
                    float: left;
                }
                img{
                    padding: 3px;
                    width: 40px;
                    height: 40px;
                }
                .text{
                    height: 40px;
                    width: calc(100% - 40px);
                    padding-left: 10px;
                    float: left;
                }
                .textInner{
                    position: relative;
                    font-size: 20px;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
                .shortcut{
                    display:inline-block;
                    position: absolute;
                    font-size: 12px;
                    right: 5px;
                    bottom: 2px;
                }`
    }
}, SelectorItem);