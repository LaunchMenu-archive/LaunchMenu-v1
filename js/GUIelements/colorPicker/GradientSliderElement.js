loadOnce("/$Utils");
loadOnce("GradientElement");
loadOnce("../BaseElement");
loadOnce("/styling/iconElement");
window.GradientSliderElementClass = class GradientSliderElementClass extends BaseElementClass{
    constructor(topLeftColor, topRightColor, bottomLeftColor, bottomRightColor, endColor, leftPer, topPer, listener){
        super(function(){
            //get color gradient
            this.topLeftColor = topLeftColor||this.attr.topleft;
            this.topRightColor = topRightColor||this.attr.topright;
            this.bottomLeftColor = bottomLeftColor||this.attr.bottomleft;
            this.bottomRightColor = bottomRightColor||this.attr.bottomright;
        });
        
        //final setup
        this.setPer(leftPer||this.attr.leftPer||0, topPer||this.attr.topPer||0);
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
                            height: 14px;
                            width: 14px;
                            
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
        if(this.topLeftColor instanceof Function){
            this.gradient = new GradientElement(this.topLeftColor);
        }else{
            this.gradient = new GradientElement({topLeft:this.topLeftColor, 
                                                 topRight:this.topRightColor,
                                                 bottomLeft:this.bottomLeftColor,
                                                 bottomRight:this.bottomRightColor});                
        }
        $(this).prepend(this.gradient);

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
            $Utils.setCursor("move");
            t.$(".cursor").css("cursor", "move");
        });
        this.mouseupListener = function(){
            t.dragging = false;
            $Utils.disableTextSelection(false);
            $Utils.setCursor();
            t.$(".cursor").css("cursor", "pointer");
        };
        var getEventPer = function(e){
            var top = e.pageY-$(t).offset().top-t.$(".cursor").height()/2;
            var topPer = top/($(t).outerHeight(true) - t.$(".cursor").outerHeight(true));
            var left = e.pageX-$(t).offset().left-t.$(".cursor").width()/2;
            var leftPer = left/($(t).outerWidth(true) - t.$(".cursor").outerWidth(true));
            return [leftPer, topPer];
        }
        this.mousemoveListener = function(e){
            if(t.dragging){
                t.setPer.apply(t, getEventPer(e));
            }
        };
        this.$("c-gradient").mousedown(function(e){
            t.$(".cursor").mousedown();
            t.setPer.apply(t, getEventPer(e));
        });
    }
    connectedCallback(){
        document.addEventListener("mouseup", this.mouseupListener);
        document.addEventListener("mousemove", this.mousemoveListener);
        this.setPer(this.leftPer, this.topPer, true);
    }
    disconnectedCallback(){
        document.removeEventListener("mouseup", this.mouseupListener);
        document.removeEventListener("mousemove", this.mousemoveListener);
    }

    
    //resolution methods
    setHorizontalResolution(resolution){
        this.gradient.maxHorizontalResolution = resolution;
    }
    setVerticalResolution(resolution){
        this.gradient.maxVerticalResolution = resolution;
    }
    
    //value methods
    setGradient(topLeft, topRight, bottomLeft, bottomRight){
        if(topLeft instanceof Function)
            this.gradient.setGradient(topLeft);
        else
            this.gradient.setGradient({topLeft:topLeft,
                                        topRight:topRight,
                                        bottomLeft:bottomLeft,
                                        bottomRight:bottomRight});
        this.topLeftColor = topLeft;
        this.topRightColor = topRight;
        this.bottomLeftColor = bottomLeft;
        this.bottomRightColor = bottomRight;
        this.setPer(this.leftPer, this.topPer); //update the value
    }
    setPer(leftPer, topPer, init){
        this.leftPer = Math.min(1, Math.max(0, leftPer));
        this.topPer = Math.min(1, Math.max(0, topPer));
        this.$(".cursor").css("left",
                ($(this).outerWidth(true) - this.$(".cursor").outerWidth(true)) * this.leftPer);
        this.$(".cursor").css("top",
            ($(this).outerHeight(true) - this.$(".cursor").outerHeight(true)) * this.topPer);
        if(this.listener){
            this.listener.call(this, this.getColor(), this.leftPer, this.topPer, init); //indicate that the initialisation caused the event to fire
        }
    }
    getColor(){
        return this.gradient.getColorPer(this.leftPer, this.topPer);
    }
}
GradientSliderElementClass.registerElement();