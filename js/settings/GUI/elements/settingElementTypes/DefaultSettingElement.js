loadOnce("../BaseSettingElement");
loadOnce("../$SettingElementTypesHandler");
window.DefaultSettingElementClass = class DefaultSettingElementClass extends BaseSettingElementClass{
    __initVars(){
        super.__initVars();
        
        this.valueTemplate = {
            html: `No element for this setting type could be found`,
            style:``
        };
    }
}
$SettingElementTypesHandler.registerElementClass(window.DefaultSettingElementClass);