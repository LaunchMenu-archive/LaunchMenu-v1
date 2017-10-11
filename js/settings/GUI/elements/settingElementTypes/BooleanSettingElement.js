loadOnce("../BaseSettingElement");
loadOnce("../$SettingElementTypesHandler");
loadOnce("/GUIelements/inputs/BooleanInputElement");
window.BooleanSettingElementClass = class BooleanSettingElementClass extends BaseSettingElementClass{
    __initHtml(){
        super.__initHtml();
        var t = this;
        this.booleanElement = new BooleanInputElement(this.setting.value, function(value){
            t.__updateSettingValue(value);
        }); 
        this.$(".value").append(this.booleanElement);
    }
    
    __valueChange(newValue, oldValue){
        this.booleanElement.setValue(newValue);
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return Math.max(setting._type?setting._type.toLowerCase()=="boolean":null, (typeof setting._defaultValue=="boolean")*0.5);
    }
}
$SettingElementTypesHandler.registerElementClass(window.BooleanSettingElementClass); 