loadOnce("../BaseElement");
loadOnce("/$Utils");
window.ColorPreviewElementClass = class ColorPreviewElementClass extends BaseElementClass{
    constructor(color, listener){
        super();
        this.setColor(color||this.attr.color||"black");
        this.listener = listener;
    }
    setListener(listener){
        this.listener = listener;
    }
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<c-icon src='resources/images/icons/transparency grid.png' class=transparencyIcon></c-icon>
                    <div class=color></div>`,
            style: `.root{
                        position: relative;
                        user-select: none;
                        z-index: 1;
                    }
                    .transparencyIcon{
                        position:absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        background-size: initial;
                        background-repeat: repeat;
                        z-index: -1;
                    }
                    .color{
                        position:absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                    }`
        }
    }
    setColor(color){
        var rgba = $Utils.getRGBA(color);
        this.$(".color").css("background-color", $Utils.rgbaToCss(rgba));
        if(this.listener)
            this.listener.call(this, color);
        this.color = rgba;
    }
    getColor(){
        if(this.color instanceof Array)
            return $Utils.rgbaToCss(this.color);
        return this.color;
    }
}
window.ColorPreviewElementClass.registerElement();