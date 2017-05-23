/*global variables Class, Utils*/
var SubWindow = (function(){
	const {BrowserWindow} = require('electron').remote;
    
    return Class("Window",{
        const: function(){
            var temp = Utils.copy(this.windowTemplate);
            temp.html = temp.html.replace("_CONTENT_", this.template.html);
            temp.style += "\n"+this.template.style;
            
            var n = Utils.createTemplateElement(this.className, temp);
            this.element = n.element;
            this.$ = n.querier;
            this.htmlClassName = n.htmlClassName;
            
            this.window = new BrowserWindow(this.windowArgs);
            var t = this;
            this.window.once('ready-to-show', function(){
                t.window.show();
            });
            this.window.on("closed", function(){
                 
            });
            
            console.log(this.window);
        },
        windowArgs:{
            title: "",
            frame: false,
            hasShadow: false,
            resizable: false,
            // transparent: true,
            useContentSize: true,
            minimizable: true,
            closeable: true,
            show: false,
        },
        windowTemplate:{
            html:   `<div class=body>
                        <div class=header>
                            <div class='windowButton minimize icon icon-minus'></div>
                            <div class='windowButton close icon icon-cross'></div>
                        </div>
                        <div class=content>
                            _CONTENT_
                        </div>
                    </div>`,
            style:  `.body{
                    }
                    .header{
                        min-width: 100px;
                        min-height: 40px;
                    }
                    .windowButton{
                        height: 30px;
                        float: right;
                    }`
        },
        template:{
            html:   ``,
            style:  ``
        },
    });
})();