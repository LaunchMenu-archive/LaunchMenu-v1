var templates = {};
window.initTemplates = function(selectors, add, parent){
    window.initTemplatesSurfix("", selectors, add, parent);    
}
window.initTemplatesSurfix = function(surfix, selectors, add, parent){
    if(!add) add="append";
    
    var selectorAr = selectors.split(",");
    var func = function(){
        for(var i=selectorAr.length-1; i>=0; i--){ //reverse loop through ar because elements will be removed
            var selector = selectorAr[i].replace(/\s*((\s|\w)*)\s*/g, "$1");
            var el = $(surfix+selector);
            if(el.length>0){
                selectorAr.splice(i, 1); //remove from array so there is no other attempt to init this
                el.removeClass("template");
                templates[selector] = {parent:parent||el.parent(), data:el[0].outerHTML, add:add};
                el.remove();
            }
        }
    };
    $(func);
    func();
}
window.loadTemplate = function(selector, parent, add){
    var template = templates[selector];
    var element = $(template.data);
    var add = add||template.add;
    if(typeof add != "string"){
        element.insertBefore(add);
    }else{
        (parent||template.parent)[add](element);
    }
    return element;
}