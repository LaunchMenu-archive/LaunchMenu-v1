loadOnce("../../popupElementWindow/PopupElementWindowController");
window.ColorPickerWindowController = class ColorPickerWindowController extends PopupElementWindowController{
    constructor(color, pointerLocation, colorChangeListener, colorSelectListener){
        super("/GUIelements/colorPicker/colorPickerWindow/ColorPickerWindow.js", [color, true], pointerLocation);
        
        this.colorChangeListener = colorChangeListener;
        this.colorSelectListener = colorSelectListener;
    }
    __initVars(){
        super.__initVars();
        this.debug = false;
    }
    setColorChangeListener(colorChangeListener){
        this.colorChangeListener = colorChangeListener;
    }
    setColorSelectListener(colorSelectListener){
        this.colorSelectListener = colorSelectListener;
    }
    __receiveColor(color){
        if(this.colorChangeListener)
            this.colorChangeListener.call(this, color);
        this.color = color;
    }
    __onHide(){
        if(this.colorSelectListener && this.color)
            this.colorSelectListener.call(this, this.color);
    }
    setColor(color){
        this.sendSetColor(color);
    }
};