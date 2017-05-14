/*global variables Class, Utils, $,  jQuery*/
var SelectorHandler = (function(){
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
        Utils.lm(".selector").append(selector.element);
    };
    sh.setOpenedSelector = function(selector, animationDuration){ //register that a selector has opened
        var top = topSelector();
        if(top!=selector){
            selector.element.css("z-index",2); //set element on top
            
            //call the events on the Selector that is currently opened
            if(top){
                top.element.css("z-index", 1); //set old top element just below the top one
                top.onHide();
                setTimeout(function(){
                    top.onHide(true);
                    top.element.css("z-index", 0); //reset the old top element to be on bottom
                }, animationDuration);
            }
                
            //remove the selector from the openedStack if it was already in there
            var index = openedStack.indexOf(selector);
            if(index>-1) openedStack.splice(index, 1);
            
            //add the Selector to the openedStack
            openedStack.push(selector);
            
            return true;
        }
        return false;
    };
    sh.closeSelector = function(selector){
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
    sh.keyboardEvent = function(event){
        var top = topSelector();
        if(top)
            return top.keyboardEvent(event);
    };
    sh.searchbarChange = function(value){
        var top = topSelector();
        if(top)
            return top.searchbarChange(value);
    };
    
    return sh;
})();