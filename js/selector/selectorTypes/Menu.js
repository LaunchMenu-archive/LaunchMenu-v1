/*global variables Class, $Utils, Selector, SelectorItem, $Searchbar, $Querier, $EventHandler*/
loadOnce("../Selector");
loadOnce("/$Utils");
loadOnce("/$EventHandler");

//set up keyboard shortcuts
$Settings.navigation.leaveMenu = {
    settingDisplayName: "Close menu",
    settingIndex: 5,
    defaultValue: new Shortcut("shift+tab")
};
$Settings.navigation.enterMenu = {
    settingSpacing: true,
    settingDisplayName: "Open menu",
    settingIndex: 4,
    defaultValue: new Shortcut("tab")
};

window.Menu = class Menu extends Selector{
    /*buttons as an array with objects with the following data:
    {
        icon: "imgUrl",
        text: "action name",
        menuHidden: boolean,            (optional,  defaults to false)
        children: buttons array,        (           sub list of actions)
        func: function,                 (           the function to execute)
        shortcut: "ctrl+s"              (optional,  a shortcut for the action)
    }
    you can not both define children and func*/
    constructor(buttons){
        super();
        if(buttons){
            this.insertButtons(buttons);    
        }
    }
    __initVars(){
        super.__initVars();
        
        //vars that could be overriden to change behaviour
        this.template = { //template for the main structure of the selector
            html:  `<div class='bg0 wrapper'>
                        <div class=header>_HEADER_</div>
                        <div class=list>
                            <c-scroll dontUpdateOnResize>
                                _LIST_
                            </c-scroll>
                        </div>
                        <div class=footer>_FOOTER_</div>
                        <div class=messageOuter style=display:none>
                            <div class=message>
                                <span class='noActionsMessage' style=display:none>
                                    No actions could be found Mother Fucker.
                                </span>
                                <span class='regexErrorMessage' style=display:none>
                                    No actions could be found Mother Fucker.
                                    <div class='errorFont0 regexError'>
                                        
                                    </div>
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
        }
        this.closeable = false                 //boolean that tells if menu is closable using shift+tab
        this.leaveKey = $Settings.navigation.leaveMenu     //the shortcut to close the menu
        this.enterKey = $Settings.navigation.enterMenu     //the shortcut to enter a sub menu
    }
    
    //events that can be tapped into and altered
    __onOpen(){              //fires when the menu opens and clears the search and selects the first item
        $Searchbar.clear(true);
        this.__searchbarChange("");
        if(this.selectorItems.length>0)
            this.selectorItems[0].select();
    }
    __onClose(){}           //fires on close and doesn't destroy the menu like Selector does by default
    __createButton(data){ //fires to create a button item
        return new MenuButton(data);
    }
    __keyboardEvent(event){
        if(this.enterKey.test(event)){
            if(this.selectedItem && this.selectedItem.subMenu){
                this.selectedItem.execute();
                return true;
            }
        }
        if(this.leaveKey.test(event) || this.enterKey.test(event)){
            if(this.parentMenu){
                this.parentMenu.open();
            }else if(this.closeable){
                this.close();
            }
            return true;
        }
        return super.__keyboardEvent(event);
    }
    __searchbarChange(value){
        if($EventHandler.trigger("search:pre", this, {text:value})){
            for(var i=0; i<this.selectorItems.length; i++){
                this.selectorItems[i].element.hide();
            }
            
            //query for matches
            var matches;
            var regexSearch = false;
            if(/\/(.+)\/(\w*)/.test(value)){
                matches = $Querier.regexQueryList(value, this.selectorItems, function(){
                    return this.text;
                });
                regexSearch = true;
            }else{
                matches = $Querier.queryList(value, this.selectorItems, function(){
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
                $Querier.prepare(value);
                for(var i=0; i<matches.length; i++){
                    var menuItem = matches[i].item;
                    menuItem.highlight(matches[i].match.type);
                    menuItem.element.show();
                }
                if(!this.selectedItem.element.is(":visible") && matches.length>0)
                    matches[0].item.select();
                this.$("c-scroll")[0].updateSize();
            }
            
            $EventHandler.trigger("search:post", this, {text:value});
            return true;
        }
        return false;
    }
    
    //button code
    insertButtons(buttons){ //add a button based on button data, which is inserted in __createButton
        if($EventHandler.trigger("insertButtons:pre", this, {buttons: buttons})){
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
                                this.addDivider()
                        }
                        
                        //insert button    
                        var button = this.__createButton(buttonItem);
                        this.addItem(button);
                        first = false;
                    }
                }else{
                    insertDivider = true;
                }
            }
            
            $EventHandler.trigger("insertButtons:post", this, {buttons: buttons});
            return true;
        }
        return false;
    }
    addButton(button){
        this.addItem(button);
    }
    addDivider(){
        this.insertItemElement(`
            <div class='bd3 bg1 divider _MenuDivider_' style='width:100%; height:20px; border-bottom-width:1px'>
            </div>
        `);
    }
    
    //other random methods
    setParentMenu(menu){ //attach a parent menu, for previous menu navigation 
        this.parentMenu = menu;
        $EventHandler.trigger("setParentMenu:post", this, {menu: menu});
    }    
    setExecuteObject(obj){//attach the object to execute the passed functions on
        if($EventHandler.trigger("setExecuteObject:pre", this, {object:obj})){
            for(var i=0; i<this.selectorItems.length; i++){
                var item = this.selectorItems[i];
                if(item.setExecuteObject)
                    item.setExecuteObject(obj);
            }
            
            $EventHandler.trigger("setExecuteObject:post", this, {object:obj});
            return true;
        }
        return false;
    }
}

loadOnce("../SelectorItem");
window.MenuButton = class MenuButton extends SelectorItem{
    constructor(icon, text, shortcut, func, children, dontCloseAfter){//you can only provide a func or children, the other must be null
        if(typeof icon == "object"){
            text = icon.text;
            shortcut = icon.shortcut;
            func = icon.func;
            children = icon.children;
            dontCloseAfter = icon.dontCloseAfter;
            icon = icon.icon;
        }
        
        super();
        
        if(children){
            this.subMenu = new Menu(children);
            this.$(".childrenIcon").css("display","block");
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
    }
    __initVars(){
        super.__initVars();
        
        this.template = {
            html:   `<div class=actionIcon>
                        <img src=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII=>
                    </div>
                    <div class='f0 text'>
                        <div class=textInner></div>
                    </div>
                    <div class='f6 shortcut'>
                    
                    </div>
                    <div class='childrenIcon bd1'>
                    </div>
                    <br style=clear:both;>`,
            style:  `.root{
                        position:relative;
                        min-height: 40px;
                        width: 100%;
                        border-bottom-width: 1px;
                    }
                    .actionIcon{
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
                    }
                    .childrenIcon{
                        display: none;
                        position: absolute;
                        right: 8px;
                        bottom: 7px;
                        
                        width: 24px;
                        height: 24px;
                        border-right-width: 6px;
                        transform: rotate(45deg);
                        border-top-width: 6px;
                    }`
        }
    }
    
    __setSelector(menu){
        this.selector = menu;
        if(this.subMenu){
            this.subMenu.setParentMenu(menu);
            this.subMenu.closeable = menu.closeable;
        }
        $EventHandler.trigger("setSelector:post", this, {selector: menu});
    }
    highlight(type){ //highlight text based on a search, argument must be an object with a highlight function
        if($EventHandler.trigger("highlight:pre", this, {matchType: type})){
            if(type){
                this.$(".textInner").html(type.highlight(this.text, this.htmlClassName+" highlightBackground0"));
            }else{
                this.$(".textInner").text(this.text);
            }
            
            $EventHandler.trigger("highlight:post", this, {matchType: type});
            return true;
        }
        return false;
    }
    setExecuteObject(obj){ //also pass the object to sub menus
        if($EventHandler.trigger("setExecuteObject:pre", this, {object:obj})){
            this.executeObj = obj;
            if(this.subMenu)
                this.subMenu.setExecuteObject(obj);
            
            $EventHandler.trigger("setExecuteObject:post", this, {object:obj});
            return true;
        }
        return false;
    }
    __onExecute(){
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
    }   
}