loadOnce("/window/WindowOverlay.js");
loadOnce("/GUIelements/ScrollElement");
window.HelpOverlay = class HelpOverlay extends WindowOverlay{
    constructor(){
        super();
        this.content = this.$("c-scroll")[0].content;
    }
    __initVars(){
        super.__initVars();
        this.contentTemplate = {
            html:  `<div class='hideButton bg3 bg2hover bd3'>
                        <div class='arrow bd8'></div>
                    </div>
                    <c-scroll vertical padding=5>
                    </c-scroll>`,
            style: `.root{
                        width: 100%;
                        height: 100%;
                    }
                    .hideButton{
                        height: 20px;
                        border-bottom-width: 1px;
                        cursor: pointer;
                    }
                    .arrow{
                        width: 15px;
                        height: 15px;
                        border-right-width: 3px;
                        border-bottom-width: 3px;
                        position: relative;
                        left: 50%;
                        transform: translate(-50%, -25%) rotate(45deg);
                    }
                    c-scroll{
                        width: 100%;
                        height: calc(100% - 20px);
                    }`
        }
        this.noHelpMessageFound = "No help message could be found";
        this.padding = 5;
    }
    __initHtml(){
        super.__initHtml();
        var t = this;
        this.$(".hideButton").click(function(){
            t.close();
        });
    }
    openHelpData(data, args){
        this.content.text("");//reset text 
        if(data.class) data = data.class //allow for an object {load:[files], class:class} to be opened too
        if(typeof data == "string"){
            this.content.text(data);
        }else if(data instanceof Object && data.html && data.style){
            var n = $Utils.createTemplateElement("HelpMessage", data, true);
            this.content.append(n.element);
        }else if(data instanceof Function && data.prototype instanceof HTMLElement){
            var elementClass = data.registerElement();
            //instantiating with argument array: https://stackoverflow.com/a/8843181/3080469
            args = [elementClass].concat(args);
            var element = new (elementClass.bind.apply(elementClass, args)); //instantiate class
            this.content.append(element);
        }else{
            this.content.text(this.noHelpMessageFound);
            console.error("The provided help data is not in a valid format, you can use the following options\n"+
                            "-HTMLElement class(or a class that extends it)\n"+
                            "-Object formatted like this: {html:  ``, style: ``}\n"+
                            "-String");
        }
        this.open();
    }
}