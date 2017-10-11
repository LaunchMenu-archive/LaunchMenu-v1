loadOnce("/GUIelements/BaseElement");
loadOnce("/styling/iconElement");
window.ErrorElementClass = class ErrorElementClass extends BaseElementClass{
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<c-icon src='resources/images/icons/status icons/error.png' size=16></c-icon>
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
        $(this).addClass("errorBackground2").addClass("errorFont0");
    }
}
window.ErrorElementClass.registerElement();