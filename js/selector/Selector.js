/*global variables Class, $Utils, $SelectorHandler, SelectorItem, $EventHandler*/
loadOnce("$SelectorHandler");
loadOnce("SelectorItem");
loadOnce("/$Utils");
loadOnce("/$EventHandler");
loadOnce("/libraries/scrollbar.js");
window.Selector = class Selector{
	constructor(){
		this.__initVars();
		
		//insert all seperate templates into the main template
        this.template = $Utils.copy(this.template); //make a local copy
        this.template.html = this.template.html.replace("_HEADER_", this.headerTemplate.html);
        this.template.html = this.template.html.replace("_FOOTER_", this.footerTemplate.html);
        this.template.html = this.template.html.replace("_LIST_",   this.listTemplate.html);
        this.template.style += this.headerTemplate.style+this.footerTemplate.style+this.listTemplate.style;
        
        
        //create element out of template
        var UID = Math.floor(Math.random()*Math.pow(10,7)); //add UID to element because there could be many instances of this class(as a menu for example)
        var n = $Utils.createTemplateElement(this.constructor.name, this.template, UID);
        
        this.element = n.element;
        this.element.css({width:"calc(100% + 1px)",height:"100%",position:"absolute", overflow:"hidden", "border-right-width":"1px"});
        this.element.addClass("bd3");
        this.htmlClassName = n.htmlClassName;
        this.$ = n.querier;
        
        this.element.selector = this;   //asociate this object with the element
        
        $SelectorHandler.registerSelector(this); //add this selector to the page
        this.__htmlInitialisation();            //initialize the html elements
        this.element.width(0);                  //make sure the selector is hidden
	}
	__initVars(){
        this.selectorItems = [];        //the selectorItems on the page
        this.selectedItem = null;       //the currently selected selectorItem
        
        this.scrolling = false;         //a boolean that indicates if the list is bing scrolled through, is used to disable item selection by mouse
        this.scrollingTimeout = null;   //the timeout id for the function that resets scrolling
        
    	this.disableSelect = false;     //disables the select temporarely so you don't move through it too quickly and create lag spikes
        
    	//vars that could be overriden to change behaviour
		this.headerTemplate = { //the template for the data above the list of items
			html: ``,
			style:``
		};
		this.footerTemplate = { //the template for the data below the list of items
			html: ``,
			style:``
		};
		this.listTemplate = { //the template for the list of items
			html: ``,
			style:``
		};
		this.template = { //template for the main structure of the selector
			html:  `<div class='bg0 wrapper'>
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
                		float: right;
					}`
		}
		
		this.animationDuration = 200; //how long the opening/closing animation is in milliseconds
	}
    
	//events that can easily be tapped into and altered
    __onHide(end){ 				  //fires when menu got hidden behind another menu
        if(end) //if end is true, the menu is fully hidden
            this.close();
    }
    __onShow(){}   				  //fires when selector gets opened because an selector above it gets closed
    __onOpen(){}   				  //fires when selector gets opened
    __onClose(){   				  //fires when the selector gets closed
        this.destroy();
    }
    __insertItemElement(element){ //fires to insert the item's element into this selector's element
        this.$("[scrollContent]").append(element);
    }
    __searchbarChange(value){}	  //fires when the searchbar value changed
    __keyboardEvent(event){ 	  //fires on keyboard events and passes the keyboard event to the currently selected item
    	if(event.key=="ArrowUp"){
    		this.selectUp();
    		return true;
    	}else if(event.key=="ArrowDown"){
    		this.selectDown();
    		return true;
    	}else if(event.key=="Enter"){
    		this.executeItem();
    		return true;
    	}
    	
    	if(this.selectedItem){
    		return this.selectedItem.__keyboardEvent(event);
    	}
    }
    __htmlInitialisation(){		  //fires when the element is added to the page, and you can initialize the element
        this.__refreshListSize();
        
        var wrapper = this.element.children(".wrapper");
        this.element.width("100%");
        wrapper.width("100%").width(wrapper.width()-2); //set width to value instead of percentange
        this.element.width(0);
        
        var t = this;
        this.$(".list").scrollbar({
    		clickScrollDuration: 0,
    		scrollListener: function(offset){
	            //indicate that the list is being scrolled through, used by the selector items to block item selection while scrolling
	            t.scrolling = true;
	            clearTimeout(t.scrollingTimeout);
	            t.scrollingTimeout = setTimeout(function(){
	                t.scrolling = false;
	            },200);
	        }
        });
    }
    isOpen(){
        return $SelectorHandler.topSelector == this;
    }
    
    //html element methods
	__refreshListSize(){ //call this function to update the height of the list, if the height of the header or footer changed
        var header = this.$(".header").first();
        var footer = this.$(".footer").first();
        this.$(".list").height(`calc(100% - ${header.height()+footer.height()}px)`);
    }

    
    //visiblity functions
    open(animationDuration){
        if(this.element.parent().length==0){
            throw new Error("a Selector can't be opened after it has been destroyed");
        }
        
        if(animationDuration==null) animationDuration=this.animationDuration;
        
        if($EventHandler.trigger("open:pre", this, {})){
            //register this selector as being opened
            if($SelectorHandler.__setOpenedSelector(this, animationDuration)){
                //open the element using css
                this.element.css("border-right-width","1px");
                if(animationDuration){
                    var wrapper = this.element.children(".wrapper");
                    this.element.width("100%");
                    wrapper.width("100%").width(wrapper.width()-2); //set width to value instead of percentange
                    this.element.width(0);
                    var t = this;
                    this.element.animate({width: "100%"}, {duration:animationDuration, complete:function(){
                        $(this).width("calc(100% + 1px)");
                    }});
                    this.__onOpen();
                }else{
                    this.element.width("calc(100% + 1px)").show();
                    this.__onOpen();
                }
                
                $EventHandler.trigger("open:post", this, {});
                return true;
            }
        }
        return false;
    }
    close(animationDuration){
        var openedStack = $SelectorHandler.openedStack;
        var index = openedStack.indexOf(this);
        
        if($EventHandler.trigger("close:pre", this, {})){
            var close = true;
            //check if there is a selector underneath to open ontop of this one
            if(index==openedStack.length-1){
                var top = openedStack[openedStack.length-2];
                if(top){
                    top.__onShow();
                    top.open(); 
                    close = false; //onHide will call close again to properly close the element
                }
            }
            //if these is no element underneath, animate the closing and call the onClose event
            if(close){
                if(animationDuration==null) animationDuration=this.animationDuration;
                var t = this;
                this.element.animate({width:0}, {duration:animationDuration, complete:function(){
                    t.element.css("border-right-width","0px");
                    t.__onClose();
                }});
                $SelectorHandler.__closeSelector(this);
            }
            
            $EventHandler.trigger("close:post", this, {});
            return true;
        }
        return false;
    }
    destroy(){ //destroy the whole selector, after it has been destroyed, it can't be opened again
        this.element.remove();
    }
    
    
    //SelectorItem code
    addItem(selectorItem){ //add new item to the item list 
        if(!selectorItem instanceof SelectorItem){
            throw Error("The first argument must be an instance of SelectorItem");
        }
        
        if($EventHandler.trigger("addItem:pre", this, {item:selectorItem})){
            //add the element to the page and register this as its Selector
            this.__insertItemElement(selectorItem.element);
            selectorItem.__htmlInitialisation();
            selectorItem.__setSelector(this);
            
            //add the item to the item set and select it if it is the first item
            this.selectorItems.push(selectorItem);
            if(this.selectorItems.length==1)
                selectorItem.select();
                
            //refresh the scrollbar to register the height change
            this.$(".list").first().scrollbar("refresh");
            
            $EventHandler.trigger("addItem:post", this, {item:selectorItem});
        }
    }
    selectItem(selectorItem){
        if(this.selectedItem==selectorItem)
            return true;
        if(selectorItem!=null){
            if($EventHandler.trigger("selectItem:pre", this, {item:selectorItem})){
                var prevItem = this.selectedItem;
                this.selectedItem = selectorItem; //register the selectorItem as the selected SelectorItem
                if(!this.selectedItem.selected)
                    if(!this.selectedItem.select()){
                        this.selectedItem = prevItem;
                        return false;
                    }
                if(prevItem)
                    prevItem.deselect(); //deselect the previous selected SelectorItem
                    
                $EventHandler.trigger("selectItem:post", this, {item:selectorItem});
                return true;
            }
        }
        return false;
    }
    focusOnSelectedItem(){ //scroll to the position of the selected SelectorItem
        if(this.selectedItem){
            if($EventHandler.trigger("focusOnSelectedItem:pre", this, {currentSelected:this.selectedItem})){
                this.$(".list")[0].focus(this.selectedItem.element, 100);
                $EventHandler.trigger("focusOnSelectedItem:post", this, {currentSelected:this.selectedItem});
            }
        }
    }
    
    selectUp(overwriteTimeout){ //select the selectorItem above the currently selected SelectorItem
        if($EventHandler.trigger("selectUp:pre", this, {currentSelected:this.selectedItem})){
            if(!this.disableSelect || overwriteTimeout){
                this.disableSelect = true;
                var t = this;
                setTimeout(function(){t.disableSelect = false}, 100);
                
                if(this.selectedItem){
                    var prev = this.selectedItem.element.prevAll(":not(.divider)").first();
                    if(prev.length>0){
                        this.selectItem(prev[0].selectorItem);
                        this.focusOnSelectedItem();
                    }
                }
                $EventHandler.trigger("selectUp:post", this, {currentSelected:this.selectedItem});
                return true;
            }
        }
        return false;
    }
    selectDown(overwriteTimeout){ //select the selectorItem below the currently selected SelectorItem
        if($EventHandler.trigger("selectDown:pre", this, {currentSelected:this.selectedItem})){
            if(!this.disableSelect || overwriteTimeout){
                this.disableSelect = true;
                var t = this;
                setTimeout(function(){t.disableSelect = false}, 100);
                    
                if(this.selectedItem){
                    var next = this.selectedItem.element.nextAll(":not(.divider)").first();
                    if(next.length>0){
                        this.selectItem(next[0].selectorItem);
                        this.focusOnSelectedItem();
                    }
                }
                $EventHandler.trigger("selectDown:post", this, {currentSelected:this.selectedItem});
                return true;
            }
        }
        return false;
    }
    executeItem(){ //execute the currently selected item
        if(this.selectedItem){
            if($EventHandler.trigger("executeItem:pre", this, {item:this.selectedItem})){
                if(!this.selectedItem.execute())
                    return false;
                $EventHandler.trigger("executeItem:post", this, {item:this.selectedItem});
                return true;
            }
        }
        return true;
    }
}

