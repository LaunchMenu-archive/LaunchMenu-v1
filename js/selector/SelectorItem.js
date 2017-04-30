/*global Class createTemplateElement*/
var SelectorItem = Class("SelectorItem", {
    const: function(){
        //create element out of template
        this.template.style += ".selected{"+this.selectedStyle+"}";
        var n = createTemplateElement(this.className, this.template);
        
        this.element = n.element;
        this.element.css({width:"100%",height:"40px"});
        this.$ = n.querier;
        
        this.element[0].selectorItem = this; //used to retrieve the SelectorItem when navigating
        this.eventSetup();
    },
    eventSetup: function(){
        var t = this;
        this.element.click(function(){
            t.execute();
        });
        this.element.mousemove(function(){
            if(!t.element.is(".selected")){
                t.select();
            }
        });
    },
    setSelector: function(selector){
        this.selector = selector;
    },
    select: function(){
        this.element.addClass("selected");
        this.selector.selectItem(this);
    },
    deselect: function(){
        this.element.removeClass("selected");
    },
    execute: function(){
        console.log("hi", this.element);
    },
    keyboardEvent: function(event){
        console.log(event);
    },
    selectedStyle: `background-color: purple;`,
    template:{
        html:   ``,
        style:  ``
    }
});
