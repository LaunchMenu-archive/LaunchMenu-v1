loadOnce("/GUIelements/ScrollElement")
window.WindowOverlay = class WindowOverlay{
    constructor(){
        this.__initVars();
        
        //create element out of template
        this.template.html = this.template.html.replace("_CONTENT_", "<div class=_CONTENT_></div>");
        var n = $Utils.createTemplateElement(this.constructor.name, this.template);
        this.element = n.element;
        this.htmlClassName = n.htmlClassName;
        this.$ = n.querier;
        
        //create content element
        var n = $Utils.createTemplateElement(this.constructor.name+"Content", this.contentTemplate);
        n.element.removeClass("_QUERYNODE_");
        this.$("._CONTENT_").replaceWith(n.element);
        
        //initialize the html elements
        this.__initHtml();
        
        //add element to page
        var origin = $(".content").first();
        if(origin.length==0) origin = $(".body").first();
        if(origin.length==0) origin = $("body").first();
        origin.append(this.element);
        if(origin.css("position")=="static")
            origin.css("position","relative");
    }
    __initVars(){
        this.template = {
            html:  `<div class='container bg0 bd0'>
                        _CONTENT_
                    </div>`,
            style: `.root{
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: 0;
                        z-index: 1000;
                    }
                    .container{
                        width: 100%;
                        height: 100%;
                        border-top-width: 1px;
                    }`
        }
        this.contentTemplate = {
            html: ``,
            style: ``
        }
        this.animationDuration = 200;
    }
    __initHtml(){}
    
    //visibility methods
    open(){
        var p = this.element.parent();
        var el = this.element;
        
        this.element.children().height(p.height()); //make the height of the content constant
        
        this.element.stop().animate({height: p.height()}, {duration: this.animationDuration, complete:function(){
            el.height("auto").css("top", 0);
            el.children().height("auto");
        }});
    }
    close(){
        var p = this.element.parent();
        this.element.height(this.element.height()).css("top", "");
        this.element.stop().animate({height: 0}, {duration: this.animationDuration});
        
        this.element.children().height(p.height());
    }
}