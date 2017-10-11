loadOnce("../BaseElement");
window.StringInputElementClass = class StringInputElementClass extends BaseElementClass{
    constructor(value, callback, updateCallback, validityCheckFunc, postInitFunc){    
        super(postInitFunc);
        $(this).width(this.attr.width||this.width).height(this.attr.height||this.height).css({
            "min-width": this.attr.minWidth||this.minWidth,
            "max-width": this.attr.maxWidth||this.maxWidth
        });
        
        value = value!==undefined?this.attr.value:value;
        this.setValue(value);
        this.changeValueCallback = callback;
        this.updateValueCallback = updateCallback;
        this.validityCheckFunc = validityCheckFunc;
    }
    __initVars(){
        super.__initVars();
        this.blurOnEnter = true;
        this.transitionTime = 200;
        this.template = {
            html:  ` <span contenteditable="true" class='f0 bd4'></span>`,
            style: `span{
                        white-space:nowrap;
                        
                        display: inline-block;
                        border-bottom-width: 1px;
                        
                        outline: none;
                        overflow: hidden;
                    }
                    .overflowLeft{
                        -webkit-mask-image:  -webkit-linear-gradient(left, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25px);
                    }
                    .overflowRight{
                        -webkit-mask-image:  -webkit-linear-gradient(right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25px);
                    }
                    .overflowLeft.overflowRight{
                        -webkit-mask-image:  -webkit-linear-gradient(left, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25px, rgba(0,0,0,1) calc(100% - 25px), rgba(0,0,0,0) 100%);
                    }`
        }
        this.width = "";
        this.height = 16;
        this.minWidth = 50;
        this.maxWidth = 150;
        this.focusedBorderClass = "successBorder0";
        this.invalidBorderClass = "errorBorder0";
    }
    
    //change connected functions
    setListener(listener){
        this.changeValueCallback = listener;
    }
    setUpdateListener(listener){        
        this.updateValueCallback = listener;
    }
    setValidityCheck(func){
        this.validityCheckFunc = func;
    }
    
    //initialisation
    connectedCallback(){
        this.input.width("auto");
        //copy width if defined
        this.input.hide(); //hide input so its size doesn't affect the element's size
        
        var width = $(this).width();
//        if(width>0) 
            this.input.width("100%");
        
        this.input.show();
    }
    __initHtml(){
        var t = this;
        
        this.input = this.$("span");
        //change border color as a focus indicator
        this.input.focus(function(){
            if(!t.invalid)
                $(this).addClass(t.focusedBorderClass);
            t.focused = true;
        }).blur(function(){
            if(!this.invalid){                
                $(this).removeClass(t.focusedBorderClass);
            }
            t.focused = false;
            t.__changeValue(t.getLiveValue());
        });
        
        //indicate value overflow
        this.input.scroll(function(event){
            t.__updateOverflowIndicator();
        });
        
        //prevent enters
        this.input.keydown(function(event){
            if(event.keyCode === 10 || event.keyCode === 13) 
                event.preventDefault();
            if(event.keyCode === 13 && t.blurOnEnter)
                $(this).blur();
            setTimeout(function(){                
                t.__updateOverflowIndicator();
                t.__updateValueValidity();
                if(t.updateValueCallback)
                    t.updateValueCallback(t.input.text());
            });
        });
    }
    
    //appearance methods
    __updateOverflowIndicator(){
        var scrollWidth = this.input[0].scrollWidth;
        var scrollLeft = this.input[0].scrollLeft;
        var width = this.input.width();
        
        var overflowLeft = scrollLeft;
        var overflowRight = scrollWidth-scrollLeft-width;
        
        if(overflowLeft>2)  this.input.addClass("overflowLeft");
        else                this.input.removeClass("overflowLeft");
        if(overflowRight>2) this.input.addClass("overflowRight");
        else                this.input.removeClass("overflowRight");
    }
    __updateValueValidity(){
        if(this.validityCheckFunc)
            this.setInvalid(!this.validityCheckFunc(this.getLiveValue()));
    }
    setInvalid(invalid){
        if(invalid){
            this.input.removeClass(this.focusedBorderClass);
            this.input.addClass(this.invalidBorderClass);
        }else{
            this.input.removeClass(this.invalidBorderClass);
            if(this.focused)
                this.input.addClass(this.focusedBorderClass);
        }
        this.invalid = invalid;
    }
    
    //value methods
    __changeValue(newValue){
        var oldValue = this.value;
        this.setValue(newValue);
        if(this.changeValueCallback)
            this.changeValueCallback.call(this, newValue, oldValue);
    }
    getLiveValue(){
        return this.input.text();
    }
    getValue(){
        return this.value;
    }
    setValue(value){
        this.value = value;
        this.input.text(value);
        this.__updateOverflowIndicator();
        this.__updateValueValidity();
    }
}
window.StringInputElementClass.registerElement(); 