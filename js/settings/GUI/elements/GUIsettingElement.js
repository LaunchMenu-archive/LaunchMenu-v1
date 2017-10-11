loadOnce("BaseSettingElement");
window.GUIsettingElementClass = class GUIsettingElementClass extends BaseSettingElementClass{
    updateVisibility(){
        this.setInvisibility(!this.visibilityCheckVisible || this.setting._settingInvisible);
    }
};