loadOnce("ColorPreviewElement");
window.ColorTemplateElementClass = class ColorTemplateElementClass extends ColorPreviewElementClass{
    constructor(color, child, clickCallback){
        super(color);
        this.child = child;
        this.callback = clickCallback;
        $(this).css("cursor", "pointer");
    }
    __initHtml(){
        super.__initHtml();
        var t = this;
        $(this).click(function(){
            if(t.callback)
                t.callback.call(t.callback, t.color);
        })
    }
    setColor(color, dontShift){
        if(this.child && !dontShift)
            this.child.setColor(this.color); //shift own color to the child
        super.setColor(color);
    }
};
window.ColorTemplateElementClass.registerElement();