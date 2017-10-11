loadOnce("/GUIelements/BaseElement");
loadOnce("/styling/iconElement");
window.SuccessElementClass = class SuccessElementClass extends BaseElementClass{
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<c-icon src='resources/images/icons/status icons/success.png' size=16></c-icon>
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
        $(this).addClass("successBackground2").addClass("successFont0");
    }
}
window.SuccessElementClass.registerElement();