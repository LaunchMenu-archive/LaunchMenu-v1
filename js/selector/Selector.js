/*global Class createTemplateElement SelectorHandler SelectorItem*/
var Selector = Class("Selector",{
    //template initialisation code
    const:function(){
        //add header and footer templates to stuff 
        this.template.html = this.template.html.replace("_HEADER_", this.headerTemplate.html);
        this.template.html = this.template.html.replace("_FOOTER_", this.footerTemplate.html);
        this.template.html = this.template.html.replace("_LIST_",   this.listTemplate.html);
        this.template.css += this.headerTemplate.style+this.footerTemplate.style+this.listTemplate.style;
        
        //create element out of template
        var n = createTemplateElement(this.className, this.template);
        
        this.element = n.element;
        this.element.css({width:"100%",height:"calc(100% - 1px)",position:"absolute"});
        this.$ = n.querier;
        
        this.element.selector = this;
        this.htmlInitialized = false;
        
        this.selectorItems = [];
        this.selectedItem = null;
    },
    headerTemplate:{
        html:   ``,
        style:  ``
    },
    footerTemplate:{
        html:   ``,
        style:  ``
    },
    listTemplate:{
        html:   ``,
        style:  ``
    },
    refreshListSize: function(){
        var header = this.$(".header").first();
        var footer = this.$(".footer").first();
        this.$(".list").height(`calc(100% - ${header.height()+footer.height()}px)`);
    },
    template:{
        html:  `<div class=wrapper>
                    <div class=header>_HEADER_</div>
                    <div class=list>_LIST_</div>
                    <div class=footer>_FOOTER_</div>
                </div>`,
        style:` .wrapper,
                .list{
                    width: 100%;
                    height:100%;
                }
                .wrapper{
                    background-color:white;
                }`
    },
    
    //opening and closing code
    animationDuration: 200,
    htmlInitialisation: function(){
        this.$(".list").scrollbar();
        this.refreshListSize();
    },
    open: function(animationDuration){
        animationDuration = this.animationDuration||animationDuration;
        if(SelectorHandler.setOpenedSelector(this, animationDuration)){
            if(animationDuration){
                var wrapper = this.element.children("._wrapper_");
                this.element.width("100%");
                wrapper.width("100%").width(wrapper.width()); //set width to value instead of percentange
                this.element.width(0);
                this.element.animate({width: "100%"}, animationDuration);
            }else
                this.element.width("100%").show();
                
            if(!this.htmlInitialized){ //initialise the scrollbar (element must be on page to do this)
                this.htmlInitialisation();
                this.htmlInitialized = true;
            }
        }
    },
    close: function(){
        var openedStack = SelectorHandler.openedStack;
        var index = openedStack.indexOf(this);
        
        if(index==openedStack.length-1){
            var top = openedStack[openedStack.length-2];
            var t = this;
            //try to open the selector below, and that one should call onHide and destroy the element
            if(top) top.open(); 
            else{
                this.element.animate({width: "0%"}, {duration:this.animationDuration, complete: function(){
                    t.element.remove();
                }});
            }
            SelectorHandler.closeSelector(this);
        }else{
            SelectorHandler.closeSelector(this);
            this.element.remove();
        }
    },
    onHide: function(end){//fires when menu got hidden behind another menu
        if(end){
            this.element.remove();
            this.close();
        }
    },
    
    //SelectorItem code
    insertItemElement: function(element){
        this.$("[scrollcontent]").append(element);
    },
    addItem: function(selectorItem){
        if(!SelectorItem.classof(selectorItem)){
            throw Error("The first argument must be an instance of SelectorItem");
            // selectorItem = new (this.defaultSelectorItemClass.bind.apply(this.defaultSelectorItemClass, arguments));
            // item = {};
            // item.__proto__ = this.defaultSelectorItemClass.prototype;
            // this.defaultSelectorItemClass.apply(item,arguments);
        }
        this.insertItemElement(selectorItem.element);
        selectorItem.setSelector(this);
        this.selectorItems.push(selectorItem);
        if(this.selectorItems.length==1)
            selectorItem.select();
        this.$(".list").first().scrollbar("refresh");
    },
    selectItem: function(selectorItem){
        if(!this.selecting && this.selectedItem!=selectorItem){
            this.selecting = true; //make sure no loop can be created if selectorItem calls this function when selectorItem.select() is ran
            if(this.selectedItem)
                this.selectedItem.deselect();
            this.selectedItem = selectorItem;
            this.selectedItem.select();
            this.selecting = false;
        }
    },
    focusOnSelectedItem: function(){
        if(this.selectedItem)
            this.$(".list")[0].focus(this.selectedItem.element);
    },
    selectUp: function(){
        if(this.selectedItem){
            var prev = this.selectedItem.element.prev();
            if(prev.length>0){
                this.selectItem(prev[0].selectorItem);
                this.focusOnSelectedItem();
                return true;
            }
        }
    },
    selectDown: function(){
        if(this.selectedItem){
            var next = this.selectedItem.element.next();
            if(next.length>0){
                this.selectItem(next[0].selectorItem);
                this.focusOnSelectedItem();
                return true;
            }
        }
    },
    execute: function(){
        if(this.selectedItem){
            return this.selectedItem.execute();
        }
    },
    keyboardEvent: function(event){
        if(this.selectedItem){
            return this.selectedItem.keyboardEvent(event);
        }
    }
});