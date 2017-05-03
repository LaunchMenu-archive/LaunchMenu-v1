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
    sh.registerSelector = function(selector){ //add the Selector's element to the page
        lm(".selector").append(selector.element);
    };
    sh.setOpenedSelector = function(selector, animationDuration){ //register that a selector has opened
        var top = topSelector();
        if(top!=selector){
            lm(".selector").append(selector.element); //add element to to the page (moves to the front if already on page)
            
            //call the events on the Selector that is currently opened
            if(top){
                top.onHide();
                setTimeout(function(){
                    top.onHide(true);
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
    
    //pass events to the top selector
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
    
    return sh;
})();