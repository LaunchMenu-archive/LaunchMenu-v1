loadOnce("../BaseElement");
window.BooleanInputElementClass = class BooleanInputElementClass extends BaseElementClass{
    constructor(value, callback){
        super(function(){
            this.template.style = this.template.style.replace(/_DURATION_/g, this.transitionTime);
        });
        
        value = value!==undefined?this.attr.value:value;
        this.value = false;
        this.setValue(value);
        this.changeValueCallback = callback; 
    }
    __initVars(){
        super.__initVars();
        this.transitionTime = 200;
        this.template = {
            html:  `<div class='container bd3 bg4'>
                        <div class='slider bd3 bg0'></div>
                    </div>`,
            style: `.root{
                        width: 34px;
                        height: 17px;
                    }
                    .container{
                        cursor: pointer;
                        
                        width: calc(100% - 6px);
                        height: calc(100% - 6px);
                        
                        transition: background-color _DURATION_ms;
                        
                        padding: 2px;
                        border-width: 1px;
                        box-shadow: inset 1px 1px 1px 0px rgba(0,0,0,0.3);
                    }
                    .slider{
                        height: calc(100% - 2px);
                        width: 12px;
                        
                        margin-left: 0px;
                        border-width: 1px;
                        box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.3);
                    }`
                    
        }
    }
    __initHtml(){
        $(this).click(function(){
            this.__changeValue(!this.value);
            $(this).focus();
        });
    }
    __changeValue(newValue){
        var oldValue = this.value;
        this.setValue(newValue);
        if(this.changeValueCallback)
            this.changeValueCallback.call(this, newValue, oldValue);
    }
    connectedCallback(){
        this.$(".slider").width(this.$(".slider").height());
        if(this.value)
            this.setValue(this.value, 0); //update the slider so it moves to the right
    }
    getValue(){
        return this.value;
    }
    setValue(value, duration){
        this.value = value;
        if(value){
            this.$(".slider").stop().animate({
                "margin-left":(this.$(".container").width()-this.$(".slider").outerWidth())+"px"
            }, duration!==undefined?duration:this.transitionTime);
            this.$(".container").addClass("successBackground0");
        }else{
            this.$(".slider").stop().animate({
                "margin-left":"0px"
            }, duration!==undefined?duration:this.transitionTime);
            this.$(".container").removeClass("successBackground0");
        }
    }
}
window.BooleanInputElementClass.registerElement(); 