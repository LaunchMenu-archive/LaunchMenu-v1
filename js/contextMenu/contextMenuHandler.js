/*global variables Utils*/
var ContextMenuHandler = (function(){
    var openedContextMenu;
    var selectedContextMenu; //the context menu that will open when hitting shift+f10
    var defaultContextMenu;
    var cmh = {
        get openedContextMenu(){
            return openedContextMenu;
        },
        get selectedContextMenu(){
            return selectedContextMenu;
        }
    };
    
    //init
    {
        var n = Utils.createTemplateElement("ContextMenuContainer", {
            html: ``,
            style: `.root{
                        position:absolute;
                        left:0;
                        right:0;
                        top:0;
                        bottom:0;
                        z-index: 3;
                    }`
        });
        var container = n.element;
        var htmlClassName = n.htmlClassName;
        var $ = n.querier;
        
        Utils.lm(".body").prepend(container);
        var containerOffset = container.offset();
        container.hide();
        
        container.mousedown(function(event){
            if(event.target==container[0]){
                cmh.closeContextMenu();
            }
        });
        $(window).mouseup(function(event){
            if(event.button==2){//right click
                if(defaultContextMenu && event.target!=container[0]){
                    defaultContextMenu.open();
                    var off = cmh.getRelativeOffset({left:event.pageX, top:event.pageY});
                    defaultContextMenu.setPosition(off.left, off.top);
                }
            } 
        });
    }
    
    
    cmh.setOpenedContextMenu = function(contextMenu){
        var root = contextMenu;
        while(root.parentMenu){
            root = root.parentMenu;    
        }
        
        if(root!=openedContextMenu){ //if menu is not descendant from current menu, close current menu
            cmh.closeContextMenu();
            cmh.setSelectedContextMenu(contextMenu);
            openedContextMenu = contextMenu;
            var buttons = contextMenu.buttons;
            if(buttons.length>0) buttons[0].select();
            container.show();
        }
        container.append(contextMenu.element);
    };
    cmh.closeContextMenu = function(contextMenu){
        if(!contextMenu) contextMenu = openedContextMenu;
        
        if(contextMenu){
            if(contextMenu.isOpened()){
                contextMenu.close();
            }
            
            if(contextMenu == openedContextMenu){
                openedContextMenu = null;
                container.hide();
            }
            contextMenu.element.detach();
        }
    };
    
    cmh.getContainerWidth = function(){
        return container.width();
    };
    cmh.getContainerHeight = function(){
        return container.height();
    };
    cmh.getElementOffset = function(element){
        return cmh.getRelativeOffset(element.offset());
    };
    cmh.getRelativeOffset = function(off){
        off.left -= containerOffset.left;
        off.top -= containerOffset.top;
        return off;
    };
    
    cmh.selectUp = function(){
        if(openedContextMenu)
            return openedContextMenu.selectUp();
    };
    cmh.selectDown = function(){
        if(openedContextMenu)
            return openedContextMenu.selectDown();
    };
    cmh.selectSubMenu = function(){
        if(openedContextMenu)
            return openedContextMenu.selectSubMenu();
    };
    cmh.selectDeselect = function(){
        if(openedContextMenu)
            return openedContextMenu.deselect();
    };
    cmh.executeButton = function(){
        if(openedContextMenu)
            return openedContextMenu.executeButton();
    };
    
    cmh.setDefaultContextMenu = function(contextMenu){
        defaultContextMenu = contextMenu;
    };
    cmh.setSelectedContextMenu = function(contextMenu, executeObject){
        if(contextMenu && executeObject)
            contextMenu.setExecuteObject(executeObject);
            
        if(!contextMenu)
            contextMenu = defaultContextMenu;
        selectedContextMenu = contextMenu;
    };
    cmh.checkShortcuts = function(event){
        if(selectedContextMenu){
            return selectedContextMenu.checkShortcuts(Utils.keyboardEventToShortcut(event));
        }
    };
    cmh.keyboardEvent = function(event){
        if(cmh.checkShortcuts(event))
            return true;
        if(openedContextMenu){
            return openedContextMenu.keyboardEvent(event);
        }
    };
    
    return cmh;
})();