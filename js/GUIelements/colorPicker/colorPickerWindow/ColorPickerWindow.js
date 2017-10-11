loadOnce("../../popupElementWindow/PopupElementWindow");
loadOnce("../ColorPickerElement");
window.ColorPickerWindow = class ColorPickerWindow extends PopupElementWindow{
    constructor(color, allowAlpha){
        super();
        var t = this;
        this.colorPicker = new ColorPickerElement(color, function(color){
            t.__sendColor(color);
        }, allowAlpha);
        this.content.append(this.colorPicker);
    }
    __initVars(){
        super.__initVars();
        this.contentTemplate = {
            html:   ``,
            style:  `.root{
                        padding: 5px;
                    }`
        };
    }
    receiveSetColor(color){
        this.colorPicker.setColor(color);
    }
};