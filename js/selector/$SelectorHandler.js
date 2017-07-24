/*global variables Class, $Utils, $,  jQuery, $EventHandler*/
loadOnce("/$Utils");
loadOnce("/$EventHandler");
window.$SelectorHandler = (function(){
    var openedStack = [];
    var topSelector = function(){
        return openedStack[openedStack.length-1];
    };
    var sh = {
        get openedStack(){
            return jQuery.extend([], openedStack);
        },
        set openedStack(value){
            
        },
        get topSelector(){
            return topSelector();
        }
    };
    
    sh.registerSelector = function(selector){ //add the Selector's element to the page
        $Utils.lm(".selector").append(selector.element);
    };
    sh.__setOpenedSelector = function(selector, animationDuration){ //register that a selector has opened
        var top = topSelector();
        if(top!=selector){
            
            //call the events on the Selector that is currently opened
            if(top){
                if($EventHandler.trigger("onHide:pre", top, {})){
                    top.element.css("z-index", 1); //set old top element just below the top one
                    top.__onHide();
                    setTimeout(function(){
                        top.__onHide(true);
                        top.element.css("z-index", 0); //reset the old top element to be on bottom
                    }, animationDuration);
                    
                    $EventHandler.trigger("onHide:post", top, {});
                }else{
                    return false;
                }
            }
            
            selector.element.css("z-index",2); //set element on top
                
            //remove the selector from the openedStack if it was already in there
            var index = openedStack.indexOf(selector);
            if(index>-1) openedStack.splice(index, 1);
            
            //add the Selector to the openedStack
            openedStack.push(selector);
            
            return true;
        }
        return false;
    };
    sh.__closeSelector = function(selector){
        //remove the Selector from the openedStack
        var index = openedStack.indexOf(selector);
        if(index>-1) openedStack.splice(index, 1);
        
        return index>-1; //return if the Selector was even opened
    };
    
    var disableSelect = false;
    //pass events to the top selector
    sh.selectUp = function(){
        if(!disableSelect){
            disableSelect = true;
            setTimeout(function(){disableSelect = false}, 100);
            
            var top = topSelector();
            if(top)
                return top.selectUp();
        }else
            return true;
    };
    sh.selectDown = function(){
        if(!disableSelect){
            disableSelect = true;
            setTimeout(function(){disableSelect = false}, 100);
            
            var top = topSelector();
            if(top)
                return top.selectDown();
        }else
            return true;
    };
    sh.executeItem = function(){
        var top = topSelector();
        if(top)
            return top.executeItem();
    };
    sh.__keyboardEvent = function(event){
        var top = topSelector();
        if(top)
            return top.__keyboardEvent(event);
    };
    sh.__searchbarChange = function(value){
        var top = topSelector();
        if(top)
            return top.__searchbarChange(value);
    };
    
    return sh;
})();