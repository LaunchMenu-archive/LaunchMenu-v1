/*global Class, $Utils, $EventHandler*/
loadOnce("/$Utils");
loadOnce("/$EventHandler");
window.SelectorItem = class SelectorItem{
    constructor(){
        this.__initVars();
        
        //create element out of template
        this.template = $Utils.copy(this.template); //make a local copy of the class' template
        this.template.style += ".selected{"+this.selectedStyle+"}"; //add styling for if the item is selected
        var n = $Utils.createTemplateElement(this.constructor.name, this.template);
        
        this.element = n.element;
        this.element.css({width:"100%","min-height":"40px"});
        this.element.addClass("bd3");
        this.htmlClassName = n.htmlClassName;
        this.$ = n.querier;
        
        this.element[0].selectorItem = this; //used to retrieve the SelectorItem when navigating
        this.__eventSetup();
    }
    __initVars(){
        this.selectedStyle = ``;
        this.template = {
            html:   ``,
            style:  ``
        }
    }
    

    //events that can be tapped into and altered
    __onExecute(){}                //fires when the item is being executed on enter
    __keyboardEvent(event){     //fires on keyboard events if the item is selected
        //return true if you use the keypress event
    }
    __initHtml(){}    //fires when the element is added to the page, and you can initialize the element
    __eventSetup(){             //fires to setup the element event listeners    
        var t = this;
        this.element.click(function(){
            t.execute();
        });
        this.element.mousemove(function(){
            if(!t.selector.scrolling) //disable selection while scrolling
                if(!t.element.is(".selected")){
                    t.select();
                }
        });
    }
    __onSelect(){}                //fires when the item is selected
    __onDeselect(){}            //fires when the item is deselected
    
    //
    __setSelector(selector){
        this.selector = selector;
        $EventHandler.trigger("setSelector:post", this, {selector: selector});
    }
    select(){
        if($EventHandler.trigger("select:pre", this, {})){
            this.selected = true;
            var ret = false;
            if(this.selector.selectItem(this)){
                this.element.addClass("bg3");
                this.element.addClass("selected");
                ret = true;
            }else{
                this.selected = false;
            }
            
            if(ret){
                this.__onSelect();
                $EventHandler.trigger("select:post", this, {});
            }
            return ret;
        }
        return false;
    }
    deselect(){
        this.element.removeClass("bg3");
        this.element.removeClass("selected");
        this.selected = false;
        this.__onDeselect();
    }
    execute(){ //execute the items function
        if($EventHandler.trigger("execute:pre", this, {})){
            if(!this.__onExecute())
                return false;
            $EventHandler.trigger("execute:post", this, {});
            return true;
        }
        return false;
    }
    __destroy(){ //intended for item removal when LargeSetSelector unloads an item
        //remove the element from the page
        this.element.remove();  
    }   
}
