loadOnce("../BaseSettingElement");
loadOnce("../$SettingElementTypesHandler");
loadOnce("/GUIelements/inputs/ShortcutInputElement");
loadOnce("/$Utils");
window.ShortcutSettingElementClass = class ShortcutSettingElementClass extends BaseSettingElementClass{
    __initHtml(){
        super.__initHtml();
        var t = this;
        this.shortcutElement = new ShortcutInputElement(this.setting.value, function(){
            t.updateSize();
        }, function(value){
            return true; //is value valid, might add a method for checking clashing shortcuts in the future
        });
        this.$(".value").append(this.shortcutElement);
    }
    
    __valueChange(newValue, oldValue){
        this.shortcutElement.setValue(newValue);
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return setting.value instanceof Shortcut;
    }
}
$SettingElementTypesHandler.registerElementClass(window.ShortcutSettingElementClass); 