loadOnce("../BaseSettingElement");
loadOnce("../$SettingElementTypesHandler");
loadOnce("/GUIelements/inputs/ColorInputElement");
window.ColorSettingElementClass = class ColorSettingElementClass extends BaseSettingElementClass{
    __initVars(){
        super.__initVars();
        this.valueTemplate = {
            html:  ``,
            style: `c-color-input{
                        width: 15px;
                        height: 15px;
                        border-width: 1px;
                        z-index: 1;
                    }`
        };
    }
    __initHtml(){
        super.__initHtml();
        var t = this;
        this.colorElement = new ColorInputElement(this.setting.value, function(value){
            t.__updateSettingValue(value);
        });        
        this.$(".value").append(this.colorElement);
        
        //change the styling of the element a bit
        $(this.colorElement).addClass(this.htmlClassName).addClass("bd1");
    }
    
    __valueChange(newValue, oldValue){
        this.colorElement.setColor(newValue);
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return setting._type && setting._type.toLowerCase()=="color";
    }
}
$SettingElementTypesHandler.registerElementClass(window.ColorSettingElementClass);