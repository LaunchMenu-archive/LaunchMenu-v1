loadOnce("StringInputElement");
window.NumberInputElementClass = class NumberInputElementClass extends StringInputElementClass{
    constructor(value, min, max, decimals, callback, updateCallback, validityCheckFunc){
        super(value, callback, updateCallback, validityCheckFunc);
        this.min = min!=null?min:this.attr.min;
        this.max = max!=null?max:this.attr.max;
        this.decimals = decimals!=null?decimals:this.attr.decimals;
    }
    __initHtml(){
        super.__initHtml();
        
        this.input.keydown(function(event){
            if(event.key.length==1 && !/[0-9\-\.]/.test(event.key))
                event.preventDefault();
        });
    }
    
    
    __changeValue(newValue){
        newValue = parseFloat(newValue);
        if(isNaN(newValue))
            newValue = this.min||this.max||0;
        super.__changeValue(newValue);
    }
    getLiveValue(){
        return parseFloat(this.input.text());
    }
    setValue(value){
        if(this.min!=null) value = Math.max(this.min, value);
        if(this.max!=null) value = Math.min(this.max, value);
        if(this.decimals!=null) value = Math.round(value*Math.pow(10, this.decimals))/Math.pow(10, this.decimals);
        super.setValue(value);
    }
}
window.NumberInputElementClass.registerElement(); 