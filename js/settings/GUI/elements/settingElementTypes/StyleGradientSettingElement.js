loadOnce("../ExpandableSettingElement");
loadOnce("../$SettingElementTypesHandler");
loadOnce("/$Utils");
loadOnce("/GUIelements/inputs/ColorInputElement");
loadOnce("/GUIelements/BaseElement");
loadOnce("/GUIelements/ExpandArrowElement");
window.StyleGradientSettingElementClass = class StyleGradientSettingElementClass extends ExpandableSettingElementClass{
    /*
     * setting format example:
     * $Settings.poop.styleGradient = {
     *         type: "styleGradient",
     *         defaultValue: {
     *             gradient: ["grey","black"],
     *             3: "orange",
     *         },
     *         shades: 5
     * };
     */
    __initVars(){
        super.__initVars();

        this.valueTemplate = {
            html:  `<c-expand-arrow clickToggle class=bd5></c-expand-arrow>
                    <c-color-input class='cStart bd1'></c-color-input>
                    <c-color-input class='cEnd bd1'></c-color-input>`,
            style: `.value>*{ /*value is the parent class*/
                        float: left; 
                    }
                    c-expand-arrow{
                        position: relative;
                        top: calc(50% - 5px);
                        margin-right: 5px;
                    }
                    c-color-input{
                        margin-left: 5px;
                        width: 15px;
                        height: 15px;
                        border-width: 1px;
                    }`
        };
        this.expandableTemplate = {
            html:  `<div class='shadesTitle bd0 f0'>Individual shades</div>
                    <div class=shades>
                    </div>`,
            style: `.shadesTitle{
                        border-top-width: 1px;
                    }`
        };
        this.shades = [];
    }    
    __initHtml(){
        super.__initHtml();
        var t = this;
        this.shadeCount = this.setting._shades;
        
        //setup color inputs
        this.startColorInput = this.$(".cStart")[0];
        this.endColorInput = this.$(".cEnd")[0];
        
        //updating values when the gradient changed
        this.startColorInput.setListener(function(color){
            t.startColor = color;
            t.startColorRgba = $Utils.getRGBA(color);
            
            t.updateGradient();
            t.__updateSettingValue();
        });
        this.endColorInput.setListener(function(color){
            t.endColor = color;
            t.endColorRgba = $Utils.getRGBA(color);
            
            t.updateGradient();
            t.__updateSettingValue();
        });
        
        //expanding the element
        this.expandArrow = this.$("c-expand-arrow");
        this.expandArrow[0].setListener(function(expanded){
            if(expanded) t.expand();
            else         t.collapse();
        });
        

        //setup individual colors
        for(var i=0; i<this.shadeCount; i++){
            var sgs = new StyleGradientShadeElement(i, this);
            this.shades.push(sgs);
            this.$(".shades").append(sgs);
        }
        
        //hide unnecessary things if there is only 1 shade
        if(this.shadeCount==1){
            $(this.endColorInput).hide();
            $(this.expandArrow).hide();
        }
    }
    
    __valueChange(newValue, oldValue){
        this.__getSettingGradient(newValue);
        this.updateGradient();

        this.startColorInput.setColor(this.startColor);
        this.endColorInput.setColor(this.endColor);
        
        //reset specific shade colors
        for(var i=0; i<this.shades.length; i++){
            this.shades[i].resetColor();
        }
        
        //set any specific shade value
        var keys = Object.keys(newValue);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            if(key!="gradient"){
                try{                    
                    var index = parseInt(key);
                    var shade = this.shades[index];
                    if(shade)
                        shade.setColor(newValue[key]);
                }catch(e){}
            }
        }
    }
    //set color methods
    __getSettingGradient(value){
        this.startColor = value.gradient[0];
        this.endColor = value.gradient[1];
        this.startColorRgba = $Utils.getRGBA(this.startColor);
        this.endColorRgba = $Utils.getRGBA(this.endColor);
    }
    getColorAtIndex(index){
        if(this.shadeCount>1){            
            return $Utils.getColorPer(this.startColorRgba, this.endColorRgba, index/(this.shadeCount-1));
        }else{
            return this.startColor;
        }
    }
    updateGradient(){
        for(var i=0; i<this.shades.length; i++){
            var shade = this.shades[i];
            shade.setGradientColor(this.getColorAtIndex(i));
        }
    }
    
    //setting methods
    __updateSettingValue(value){
        if(!value){
            value = {};
            value.gradient = [this.startColor, this.endColor];
            for(var shade of this.shades){
                if(shade.custom)
                    value[shade.index] = shade.getColor();
            }
        }
        super.__updateSettingValue(value);
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return setting._type&&setting._type.toLowerCase()=="stylegradient";
    }
}
$SettingElementTypesHandler.registerElementClass(window.StyleGradientSettingElementClass); 

window.StyleGradientShadeElementClass = class StyleGradientShadeElementClass extends BaseElementClass{
    constructor(index, parent){
        super();
        
        this.index = index;
        this.parent = parent;
        this.$(".index").text(index);
    }
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<div class=index></div>
                    <div class=reset>reset</div>
                    <c-color-input class=bd1></c-color-input>`,
            style: `.root{
                        margin-top: 5px;
                        display: flex;
                    }
                    .index{
                        flex-grow: 1;
                    }
                    .reset{
                        margin-right: 5px;
                        cursor: pointer;
                    }
                    .reset:hover{
                        text-decoration: underline;
                    }
                    c-color-input{
                        width: 15px;
                        height: 15px;
                        border-width: 1px;
                    }`
        }
    }
    __initHtml(){
        super.__initHtml();
        var t = this;
        
        this.colorInput = this.$("c-color-input")[0];
        this.colorInput.setListener(function(){
            t.custom = true;
            t.$(".reset").show();
            
            t.parent.__updateSettingValue();
        });
        
        this.$(".reset").click(function(){
            t.resetColor();
            t.parent.__updateSettingValue();
        }).hide();
    }
    
    //color methods
    setGradientColor(color){
        if(!this.custom){
            this.colorInput.setColor(color);
        }
        this.gradientColor = color;
    }
    setColor(color){
        this.colorInput.setColor(color, true); //true makes it so the listener is called
    }
    resetColor(){
        if(this.custom){            
            this.custom = false;
            this.colorInput.setColor(this.gradientColor);
            this.$(".reset").hide();
        }
    }
    getColor(){
        return this.colorInput.getColor();
    }
}
window.StyleGradientShadeElementClass.registerElement();