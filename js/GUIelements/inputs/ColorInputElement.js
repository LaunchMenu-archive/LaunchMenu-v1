loadOnce("../colorPicker/ColorPreviewElement");
loadOnce("../colorPicker/ColorPickerWindow/ColorPickerWindowController");
window.ColorInputElementClass = class ColorInputElementClass extends ColorPreviewElementClass{
    constructor(value, listener){
        super();    
        this.selectListener = listener;
        
        //create colorPicker if it doesn't exist already
        if(window.colorPicker==null){
            window.colorPicker = new ColorPickerWindowController("black", [-10000, -10000]);  
        }
    }
    setListener(listener){
        this.selectListener = listener;
    }
    __initHtml(){
        super.__initHtml();
        var t = this;
        $(this).css({
            "cursor": "pointer",
            "min-width": "10px",
            "min-height": "10px",
        });
        $(this).click(function(){
            $Window.sendGetPosition(function(pos){
                var offset = $(t).offset();
                //get the bottom center position of the element on the monitor
                pos[0] += Math.ceil(offset.left + $(t).outerWidth()/2);
                pos[1] += Math.ceil(offset.top + $(t).outerHeight());
                    
                var colorPicker = window.colorPicker;
                if(colorPicker){ //there should always be a color picker, otherwise something went quite wrong
                    colorPicker.setColor(t.color);
                    colorPicker.setColorChangeListener(function(color){
                        t.setColor(color);
                    });
                    colorPicker.setColorSelectListener(function(color){
                        t.setColor(color, true);
                    });
                    colorPicker.show(pos[0], pos[1]);
                }
            });
        });
    }
    setColor(color, sendChange){
        super.setColor(color);
        if(this.selectListener && sendChange){
            this.selectListener.call(this, color);
        }
    }
}
window.ColorInputElementClass.registerElement(); 