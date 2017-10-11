loadOnce("/GUIelements/BaseElement");
loadOnce("/styling/iconElement");
window.WarningElementClass = class WarningElementClass extends BaseElementClass{
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<c-icon src='resources/images/icons/status icons/warning.png' size=16></c-icon>
                    <span class=content>
                        _CHILDREN_ 
                    </span>`,
            style: `.root{
                        padding: 10px;
                    }`,
        }
    }
    __initHtml(){
        $(this).addClass("warningBackground2").addClass("warningFont0");
    }
}
window.WarningElementClass.registerElement();