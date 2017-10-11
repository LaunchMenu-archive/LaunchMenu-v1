loadOnce("../BaseSettingElement");
loadOnce("../$SettingElementTypesHandler");
loadOnce("/GUIelements/inputs/NumberInputElement");
window.NumberSettingElementClass = class NumberSettingElementClass extends BaseSettingElementClass{
    __initHtml(){
        super.__initHtml();
        var t = this;
        this.numberElement = new NumberInputElement(this.setting.value, null, null, null, function(value){
            var newValue = value
            if(t.setting._validations){                
                if(t.setting._validations.min!=null) newValue = Math.max(t.setting._validations.min.value, newValue);
                if(t.setting._validations.max!=null) newValue = Math.min(t.setting._validations.max.value, newValue);
                if(t.setting._validations.decimals!=null){
                    var n = Math.pow(10, t.setting._validations.decimals.value)
                    newValue = Math.round(newValue*n)/n;
                }
            }
            if(newValue!=value && !isNaN(newValue)) this.setValue(newValue);
            if(isNaN(newValue)) console.warn("Something is wrong with the validation values of ", t.setting);
            
            t.__updateSettingValue(newValue);
        }, function(){
            t.updateSize();
        }, function(value){
            return t.isValueValid(value).success;
        });
        this.$(".value").append(this.numberElement);
    }
    
    __valueChange(newValue, oldValue){
        this.numberElement.setValue(newValue);
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return Math.max(setting._type?setting._type.toLowerCase()=="number":null, (typeof setting._defaultValue=="number")*0.5);
    }
}
$SettingElementTypesHandler.registerElementClass(window.NumberSettingElementClass); 