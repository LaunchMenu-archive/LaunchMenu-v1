/*global Class Selector $ SelectorItem*/
var LargeSetSelector = Class("LargeSetSelector", {
    const: function(){
        this.super.const();
        
        this.dataSet = [];              //the set of data that will be displayyed
        this.selectorItemHeight = 0;    //the general height that items will have
        this.selectedIndex = 0;         //the item index that is currently selected
    },
    htmlInitialisation: function(){
        var t = this;
        var lastOffset = 0;
        this.$(".list").scrollbar({clickScrollDuration:0,scrollListener: function(offset){
            if(Math.abs(lastOffset-offset)>60){ //up date the element, but not too often
                t.loadElements();
                lastOffset = offset;
            }
            
            //indicate that the list is being scrolled through, used by the selector items to block item selection while scrolling
            t.scrolling = true;
            clearTimeout(t.scrollingTimeout);
            t.scrollingTimeout = setTimeout(function(){
                t.scrolling = false;
            },200);
        }});
        this.refreshListSize();
    },
    listTemplate:{
        html:   `<div class=content></div>`,
        style:  `.content{
                    width: 100%;
                    display: inline-block;
                }`
    },
    
    //disabled functions because an entire dataset should be passed
    addItem: function(item){
        throw new Error("You can only use setDataSet() to define the items when using the LargeSetSelector");
    },
    insertItemElement: function(element){},
    
    setDataSet: function(list){
        if(!(list instanceof Array)){
            throw new Error("the first argument should be an array of objects");
        }
        var items = this.$(".content").first().children();
        for(var i=0; i<items.length; i++){ //remove all currently loaded items
            items[i].selectorItem.destroy(); 
        }
        
        this.dataSet = list;
        if(this.dataSet.length>0){
            //get the general item height based on the first item in the list
            var item = this.createSelectorItem(list[0]);
            $("body").append(item.element);
            this.selectorItemHeight = item.element.height();
            item.element.remove();    
        }else{
            this.selectorItemHeight = 0;
        }
        
        //set the content height based on the item height and the number of items
        //the content height might be different from this estimate, because the item height can differ
        //but this will be accounted for when loading those items
        this.$(".content").height(this.selectorItemHeight*this.dataSet.length);
        
        // load elements from the dataset, this will also select the selectedIndex;
        this.selectedIndex = 0;
        this.loadElements();
        
        this.$(".list").first().scrollbar("reset");
    },
    loadElements: function(){
        var list = this.$(".list");
        var verticalOffset = list[0].getVerticalOffset();
        var items = this.$(".content").children();
        var scrollTop = list.offset().top;
        var height = list.height();
        
        //find the things that are outside of the element range
        var removeItems = [];
        for(var i=0; i<items.length; i++){
            var item = $(items[i]);
            var itemTop = item.offset().top;
            var remove = false;
            if(itemTop<scrollTop-0.5*height) //item is below loading region
                remove = true;
            if(itemTop>scrollTop+1.5*height) //item is above loading region
                remove = true;
            if(remove){
                removeItems.push(items[i].selectorItem);
            }
        }
        
        //remove the files
        for(var i=0; i<removeItems.length; i++){
            var item = removeItems[i];
            this.removeSelectorItem(item);
        }
           
        insertEnd:{
            //find first index to insert items from at the end of the set
            items = this.$(".content").children();
            var itemIndex;
            if(items.length==0){
                //get index based on position
                itemIndex = Math.max(0,Math.floor((verticalOffset-0.3*height)/this.selectorItemHeight));
            }else{
                //get index based on last item in list
                var lastItem = items.last();
                itemIndex = Number(lastItem.attr("ID"))+1;
                if(lastItem.length!=0 && lastItem.offset().top+lastItem.height()>scrollTop+1.2*height) break insertEnd; //don't attempt to load stuff if enough items are loaded already
            }
            
            //insert the necessairy items at the end of the set
            while(itemIndex<this.dataSet.length){
                if(this.$("#"+itemIndex).length==0){//don't load the item if it is already on the page for some reason
                    var selectorItem = this.createSelectorItem(this.dataSet[itemIndex]);
                    var el = selectorItem.element;
                    this.insertSelectorItem(selectorItem, itemIndex++);
                    if(el.offset().top>scrollTop+1.2*height) break; //stop loading items when enough are loaded
                }else
                    itemIndex++;
            }
        }
        
        insertStart:{
            //find last index to insert items from at the start of the set
            items = this.$(".content").children();
            var itemIndex;
            if(items.length==0){
                //get index based on position
                itemIndex = Math.min(this.dataSet.length-1,Math.floor((verticalOffset+1.2*height)/this.selectorItemHeight));
            }else{
                //get index based on first item in list
                var firstItem = items.first();
                itemIndex = Number(firstItem.attr("ID"))-1;
                if(firstItem.length!=0 && firstItem.offset().top+firstItem.height()<scrollTop-0.3*height) break insertStart; //don't attempt to load stuff if enough items are loaded already
            }
            
            //insert the necessairy items at the start of the set
            while(itemIndex>=0){
                if(this.$("#"+itemIndex).length==0){ //don't load the item if it is already on the page for some reason
                    var selectorItem = this.createSelectorItem(this.dataSet[itemIndex]);
                    var el = selectorItem.element;
                    this.insertSelectorItem(selectorItem, itemIndex--);
                    if(el.offset().top<scrollTop-0.3*height) break;//stop loading items when enough are loaded
                }else
                    itemIndex--;
            }
        }
    },
    createSelectorItem: function(item){ //this the function that determines what SelectorItem class is used to load the items
        return new SelectorItem(item);
    },
    insertSelectorItem: function(selectorItem, index){
        var items = this.$(".content").children();
        var element = selectorItem.element;
        element.attr("ID",index);       //store the index in the id of the element
        selectorItem.setSelector(this); //make sure the selectorItem has a reference to the selector
        if(index==this.selectedIndex)   //select the item if this item was previously selected and unloaded because it went outside the visible range
            selectorItem.select();
        var prevFirstItem = $(items[0]);
        
        add:{ 
            //check if there are elements to inser the item relative to
            if(items.length>0){
                //check the first three higher and lower ids if they can be found to place relative to that
                for(var i=0; i<3; i++){
                    var n;
                    if((n = items.filter("#"+(index+i))).length>0){
                        element.insertBefore(n);
                        break add;
                    }
                    if((n = items.filter("#"+(index-i))).length>0){
                        element.insertAfter(n);
                        break add;
                    }
                }
                //find the closest id to place relative to
                var distance = 10000;
                var closest = null;
                for(var i=0; i<items.length; i++){
                    var item = $(items[i]);
                    var delta = Math.abs(Number(item.attr("ID"))-index);
                    if(delta<distance){
                        distance = delta;
                        closest = item;
                    }
                }
                if(closest){
                    if(Number(closest.attr("ID"))>index){
                        element.insertBefore(closest);
                    }else{
                        element.insertAfter(closest);     
                    }
                    break add;
                }
            }else{
                this.$(".content").append(element);
                break add;
            }
            
            //there is no real reason this code should be reached
            element.attr("ID","");
            return;
        }
        
        // update the content height if the height did not match the general selectorItemHeight
        var deltaHeight = element.height()-this.selectorItemHeight;
        if(deltaHeight!=0)
            this.alterContentHeight(deltaHeight);
        
        //set the margin at the top if this is the new highest item in the list
        if(element.index()==0){
            prevFirstItem.css({"margin-top":0}).removeClass("first");
            element.css({"margin-top":index*this.selectorItemHeight+"px"}).addClass("first");   
        }
    },
    removeSelectorItem: function(selectorItem){
        var element = selectorItem.element;
        
        //set the second item to be the new highest item, if this item was the highest item
        if(element.is(".first")){
            var el = element.next();
            if(el)
                el.css("margin-top",this.selectorItemHeight*Number(el.attr("ID"))).addClass("first");
        }
        //set selectedItem to null if this was the selected item
        if(selectorItem == this.selectedItem){
            this.selectedItem = null;
        }
        
        //update the content height if this height was not the same as the general selectorItemHeight
        var deltaHeight = element.height()-this.selectorItemHeight;
        if(deltaHeight!=0)
            this.alterContentHeight(-deltaHeight);
            
        //destroy the object, (should destroy the html element)
        selectorItem.destroy();
    },
    alterContentHeight: function(delta){
        var c = this.$(".content");
        //change the height of content, because an item's height might not have been the general selectorItemheight
        //animate the height change, so it is smoother and less noticeable
        var d = 0;
        $({d:0}).animate({d:delta}, {easing:"linear", duration:500, step:function(now){
            now = Math.floor(now);
            var del = now-d;
            c.height(c.height()+del);
            d = now;
        }});
    },
    
    selectItem: function(selectorItem, firedBySelectorItem){
        //set the selected index when selecting an item, so it can be reselected after being unloaded because it fell outside the visible item range
        if(this.super.selectItem(selectorItem, firedBySelectorItem)){
            this.selectedIndex = Number(selectorItem.element.attr("ID"));
            return true;
        }
        return false;
    }, 
    selectUp: function(){
        if(this.selectedItem){ //select up as per usual
            return this.super.selectUp();
        }else{
            //scroll to the position of the selected item, because it has been unloaded
            var list = this.$(".list");
            list[0].focusVertical((this.selectedIndex-1)*this.selectorItemHeight-list.height()/2,200);
            return true;
        }
    },
    selectDown: function(){
        if(this.selectedItem){ //select up as per usual
            return this.super.selectDown();
        }else{
            //scroll to the position of the selected item, because it has been unloaded
            var list = this.$(".list");
            list[0].focusVertical((this.selectedIndex-1)*this.selectorItemHeight-list.height()/2,200);
            return true;
        }
    },
}, Selector);