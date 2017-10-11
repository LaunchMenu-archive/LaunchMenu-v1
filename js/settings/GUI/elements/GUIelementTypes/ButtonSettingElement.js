loadOnce("../GUIsettingElement");
loadOnce("../$SettingElementTypesHandler");
loadOnce("/GUIelements/ButtonElement");
window.ButtonSettingElementClass = class ButtonSettingElementClass extends GUIsettingElementClass{
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<div class='container f0 bg0 bd0'>
                        <div class='disabledOverlay bg4'></div>
                    </div>`,
            style: `.root{
                        margin-top: -1px; /*make bottom and top borders of settings overlap*/
                        width: fit-content;
                        min-width: 100%;
                    }
                    .container{
                        border-width: 1px;
                        min-height: 17px;
                        padding: 5px;
                        box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
                        
                        width: fit-content;
                        min-width: calc(100% - 12px); /*subtract padding and border*/
                        
                        display: flex;
                        justify-content: space-around;
                    }
                    c-button{
                        margin-right: 5px;
                    }
                    .disabled .disabledOverlay{
                        display: block;
                    }
                    .disabledOverlay{
                        display: none;
                        
                        cursor: not-allowed;
                        opacity: 0.5;
                        
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                    }`
        };    
    }
    __initHtml(){
        super.__initHtml();
        
        //create the button(s) in the element
        if(this.setting._text instanceof Array && this.setting._func instanceof Array){
            var buttons = Math.min(this.setting._text.length, this.setting._func.length);
            for(var i=0; i<buttons; i++){
                var buttonElement = new ButtonElement(this.setting._text[i], this.setting._func[i]);
                this.$(".container").append(buttonElement);
                $(buttonElement).css("min-width", buttons>1?200/buttons:120).addClass(this.htmlClassName);
            }            
        }else{
            var buttonElement = new ButtonElement(this.setting._text, this.setting._func);
            this.$(".container").append(buttonElement);
            $(buttonElement).css("min-width", 120).addClass(this.htmlClassName);
        }
    }
    
    __setToTrueWidth(val){
        if(val){
            this.$(".container").css("min-width", "auto");
        }else{
            this.$(".container").css("min-width", "");
        }
    }
    
    static matchesSetting(setting){ //code to determine if the setting element matches the setting
        return setting._type=="button";
    }
};
$SettingElementTypesHandler.registerElementClass(window.ButtonSettingElementClass); 