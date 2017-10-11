loadOnce("../BaseSettingElement");
loadOnce("../$SettingElementTypesHandler");
loadOnce("/GUIelements/inputs/StringInputElement");
window.StringSettingElementClass = class StringSettingElementClass extends BaseSettingElementClass{
    __initHtml(){
        super.__initHtml();
        var t = this;
        this.stringElement = new StringInputElement(this.setting.value, function(value){
            t.__updateSettingValue(value);
        }, function(){
            t.updateSize();
        }, function(value){
            return t.isValueValid(value).success;
        });
        this.$(".value").append(this.stringElement);
    }
    
    __valueChange(newValue, oldValue){
        this.stringElement.setValue(newValue);
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return Math.max(setting._type?setting._type.toLowerCase()=="string":null, (typeof setting._defaultValue=="string")*0.5);
    }
}
$SettingElementTypesHandler.registerElementClass(window.StringSettingElementClass); 