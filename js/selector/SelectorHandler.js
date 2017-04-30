/*global variables Class lm $ createTemplateElement jQuery*/
var SelectorHandler = (function(){
    var openedStack = [];
    var sh = {
        get openedStack(){
            return jQuery.extend([], openedStack);
        },
        set openedStack(value){
            
        }
    };
    
    var topSelector = function(){
        return openedStack[openedStack.length-1];
    };
    sh.setOpenedSelector = function(selector, animationDuration){
        var top = topSelector();
        if(top!=selector){
            lm(".selector").append(selector.element); //add element to selectorstack (moves to the front if already on page)
            if(top){
                top.onHide();
                setTimeout(function(){
                    top.onHide(true);
                }, animationDuration);
            }
                
            var index = openedStack.indexOf(selector);
            if(index>-1) openedStack.splice(index, 1);
            
            openedStack.push(selector);
            
            return true;
        }
        return false;
    };
    sh.closeSelector = function(selector){
        var index = openedStack.indexOf(selector);
        if(index>-1) openedStack.splice(index, 1);
        return index>-1;
    };
    
    sh.selectUp = function(){
        var top = topSelector();
        if(top)
            return top.selectUp();
    };
    sh.selectDown = function(){
        var top = topSelector();
        if(top)
            return top.selectDown();
    };
    sh.execute = function(){
        var top = topSelector();
        if(top)
            return top.execute();
    };
    sh.keyboardEvent = function(event){
        var top = topSelector();
        if(top)
            return top.keyboardEvent(event);
    };
    
    return sh;
})();