loadOnce("/$Utils");
loadOnce("GradientElement");
loadOnce("../BaseElement");    
loadOnce("/styling/iconElement");
window.VerticalGradientSliderElementClass = class VerticalGradientSliderElementClass extends BaseElementClass{
    constructor(beginColor, endColor, per, listener){
        super(function(){
            //get color gradient
            this.beginColor = beginColor||this.attr.begin;
            this.endColor = endColor||this.attr.end;                
        });
        
        //final setup
        this.setPer(per||this.attr.per||0);
        this.listener = listener;
    }
    setListener(listener){
        this.listener = listener;
    }
    __initVars(){
        super.__initVars();
        this.template = {
                html:  `<div class='cursor bd9'>
                            <div class='cursorInner left bg0'></div>
                            <div class='cursorInner right bg0'></div>
                            <div class='cursorInner top bg0'></div>
                            <div class='cursorInner bottom bg0'></div>
                        </div>`,
                style: `.root{
                            padding: 4px;
                            position: relative;
                            box-sizing: border-box;
                            user-select: none;
                        }
                        c-gradient{
                            width: 100%;
                            height: 100%;
                        }
                        .cursor{
                            cursor: pointer;
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 14px;
                            border-width: 1px;
                            box-sizing: border-box;
                        }
                        .cursorInner{
                            position:absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                        }
                        .left, .right{
                            width: 3px;
                        }
                        .top, .bottom{
                            height: 3px;
                        }
                        .left{
                            right: auto;
                        }
                        .right{
                            left: auto;
                        }
                        .top{
                            bottom: auto;
                        }
                        .bottom{
                            top: auto;
                        }
                        `
        };
    }
    //input setup
    __initHtml(){
        //create gradient
        if(this.beginColor instanceof Function){
            this.gradient = new GradientElement(this.beginColor);
        }else{
            this.gradient = new GradientElement({direction:"vertical", begin:this.beginColor, end:this.endColor});                
        }
        $(this).prepend(this.gradient);
        this.gradient.maxHorizontalResolution = 1;

        //set the alpha pattern behind the gradient
        var transparencyIcon = new IconElement("resources/images/icons/transparency grid.png");
        $(transparencyIcon).css({
            "position":"absolute",
            "left": "0",
            "top": "0",
            "right": "0",
            "bottom": "0",
            "background-size": "initial",
            "background-repeat": "repeat",
            "z-index": "-1"
        });
        $(this.gradient).css("position","relative").prepend(transparencyIcon);

        //set up events
        var t = this;
        this.dragging = false;
        this.$(".cursor").mousedown(function(){
            t.dragging = true;
            $Utils.disableTextSelection(true);
            $Utils.setCursor("n-resize");
            t.$(".cursor").css("cursor", "n-resize");
        });
        this.mouseupListener = function(){
            t.dragging = false;
            $Utils.disableTextSelection(false);
            $Utils.setCursor();
            t.$(".cursor").css("cursor", "pointer");
        };
        var getEventPer = function(e){
            var top = e.pageY-$(t).offset().top-t.$(".cursor").height()/2;
            var per = top/($(t).outerHeight(true) - t.$(".cursor").outerHeight(true));
            return per;
        }
        this.mousemoveListener = function(e){
            if(t.dragging){
                t.setPer(getEventPer(e));
            }
        };
        this.$("c-gradient").mousedown(function(e){
            t.$(".cursor").mousedown();
            t.setPer(getEventPer(e));
        });
    }
    connectedCallback(){
        document.addEventListener("mouseup", this.mouseupListener);
        document.addEventListener("mousemove", this.mousemoveListener);
        this.setPer(this.per, true);
    }
    disconnectedCallback(){
        document.removeEventListener("mouseup", this.mouseupListener);
        document.removeEventListener("mousemove", this.mousemoveListener);
    }
    

    //resolution methods
    setVerticalResolution(resolution){
        this.gradient.maxVerticalResolution = resolution;
    }
    
    //value methods
    setGradient(begin, end){
        if(begin instanceof Function)
            this.gradient.setGradient(begin);
        else
            this.gradient.setGradient({begin:begin, end:end, direction:"vertical"});
        this.beginColor = begin;
        this.endColor = end;
        this.setPer(this.per); //update the value
    }
    setPer(per, init){
        this.per = Math.min(1, Math.max(0, per));
        this.$(".cursor").css("top",
            ($(this).outerHeight(true) - this.$(".cursor").outerHeight(true)) * this.per);
        if(this.listener){
            this.listener.call(this, this.getColor(), this.per, init);  //indicate that the initialisation caused the event to fire
        }
    }
    getColor(){
        return this.gradient.getColorPer(0, this.per);
    }
}
VerticalGradientSliderElementClass.registerElement();