/*global variables Class lm $ createTemplateElement*/
var SelectorHandler = (function(){
    var openedSelector = null;
    var sh = {};
    
    sh.setOpenedSelector = function(selector, animated){
        if($("._"+selector.className+"_").length==0) 
            lm(".selector").append(selector.element);
        if(openedSelector!=selector){
            if(openedSelector){
                openedSelector.close(animated);
            }
            openedSelector = selector;
            return true;
        }
        return false;
    }
    
    return sh;
})();

var Selector = Class("Selector",{
    const:function(){
        this.template = "<div>"+this.template+"</div>";
        var n = createTemplateElement(this.name, this.template);
        
        this.element = n.element;
        this.element.css({width:"100%",height:"100%",display:"none"});
        this.$ = n.querier;
    },
    template:{
        html:``,
        style:``
    },
    destroyOnclose: true,
    animatedOpening: true,
    open: function(animated){
        animated = this.animatedOpening||animated;
        if(SelectorHandler.setOpenedSelector(this, animated)){
            if(animated){
                
            }else
                this.element.show();
        }
    },
    close: function(animated){
        if(animated){
            
        }else
            this.element.hide();
            
        if(this.destroyOnclose){
            this.element.remove();
        }
    }
});