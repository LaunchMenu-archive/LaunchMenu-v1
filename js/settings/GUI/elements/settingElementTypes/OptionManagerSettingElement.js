loadOnce("../BaseSettingElement");
loadOnce("/GUIelements/inputs/optionManager/OptionManagerInputElement");
loadOnce("../$SettingElementTypesHandler");
window.OptionManagerSettingElementClass = class OptionManagerSettingElementClass extends BaseSettingElementClass{
    __initHtml(){
        super.__initHtml();
        var t = this;
        var val = this.setting.value;
        this.optionManagerElement = new OptionManagerInputElement(val.options, val.selected.ID, function(){
            var options = this.options;
            var selected = this.getSelected();
            var selectedIndex = this.getSelectedIndex();
            t.__updateSettingValue({
                options: options,
                selected:{
                    ID: selected[1],
                    text: selected[0],
                    index: selectedIndex
                }
            }, arguments);
        });
        $(this.optionManagerElement).css("min-width", "150px");
        this.$(".value").append(this.optionManagerElement);
    }
    
    __valueChange(newValue, oldValue){
        this.optionManagerElement.setData(newValue.options, newValue.selected.ID);
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return setting._type && setting._type.toLowerCase()=="optionmanager";
    }
}
$SettingElementTypesHandler.registerElementClass(window.OptionManagerSettingElementClass); 