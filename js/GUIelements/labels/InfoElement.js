loadOnce("/GUIelements/BaseElement");
loadOnce("/styling/iconElement");
window.InfoElementClass = class InfoElementClass extends BaseElementClass{
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<c-icon src='resources/images/icons/status icons/info.png' size=16></c-icon>
                    <span class=content>
                        _CHILDREN_ 
                    </span>`,
            style: `.root{
                        padding: 10px;
                    }
                    .icon{
                        position:relative;
                        top: 2px;
                        left: 2px;
                    }`,
        }
    }
    __initHtml(){
        $(this).addClass("infoBackground2").addClass("infoFont0");
    }
}
window.InfoElementClass.registerElement();