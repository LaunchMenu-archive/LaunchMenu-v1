loadOnce("StringInputElement");
loadOnce("/Shortcut")
loadOnce("/$Utils");
window.ShortcutInputElementClass = class ShortcutInputElementClass extends StringInputElementClass{
    constructor(shortcut, updateCallback, validityCheckFunc, postInitFunc){
        if(!(shortcut instanceof Shortcut)) 
            shortcut = new Shortcut(shortcut);
        
        super(shortcut, null, null, validityCheckFunc, postInitFunc);
        this.updateValCallback = updateCallback;
    }    
    __initVars(){
        super.__initVars();
        this.blurOnEnter = false;
        this.minWidth = 100;
    }

    setListener(listener){
        this.updateValCallback = listener;
    }
    setUpdateListener(listener){        
        this.updateValCallback = listener;
    }
    
    __initHtml(){
        super.__initHtml();

        var t = this;
        var specialKeys = ["ctrlKey","shiftKey","altKey"];
        var pressedKeys = {};
        this.input.keydown(function(event){
            event.preventDefault();
            if(!pressedKeys[event.key]){
                pressedKeys[event.key] = true;
                
                if(event.keyCode!=8){ //add shortcut if not hitting backspace
                    t.value.setLastShortcut(event);                    
                }else{                //remove shortcut if hitting backspace
                    t.value.removeShortcut();
                }
                
                t.__updateValue();
                t.__moveCursor();
                if(this.updateValCallback)
                    this.updateValCallback(this.value);
            }
        });
        this.input.keyup(function(event){
            event.preventDefault();
            delete pressedKeys[event.key];
            
            //check if this was the last key you were holding
            var lastKeyOfShortcut = true;
            for(var i=0; i<specialKeys.length; i++){
                if(event[specialKeys[i]])
                    lastKeyOfShortcut = false;
            }
            
            //add the shortcut, if it was the final key, otherwise update the shortcut
            if(lastKeyOfShortcut)
                t.value.addShortcut();

            t.__updateValue();
            t.__moveCursor(); 
            if(this.updateValCallback)
                this.updateValCallback(this.value);
        });
        
        //move cursor when focusing or blurring
        this.input.focus(function(){
            setTimeout(function(){
                if($(t.input).is(':focus'))
                    t.__moveCursor();                
            }, 0);
        }).blur(function(){
            t.value.addShortcut();
            t.__updateValue();
            t.input.scrollLeft(0);
        });
    }
    __moveCursor(){
        //https://stackoverflow.com/a/3866442/8521718
        var range = document.createRange();
        range.selectNodeContents(this.input[0]);
        range.collapse(false);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        //scroll to the end of the line
        this.input.scrollLeft(1000000);
    }
    
    //value methods
    setValue(value){
        if(!(value instanceof Shortcut)) value = new Shortcut(value);
        this.value = value;
        this.input.text(this.value.shortcut);
        this.__updateOverflowIndicator();
        this.__updateValueValidity();
    }
    __updateValue(){
        this.input.text(this.value.shortcut);
    }
    getLiveValue(){
        return this.value;
    }
    addShortcut(shortcut){
        this.value.addShortcut(shortcut);
    }
}
window.ShortcutInputElementClass.registerElement(); 