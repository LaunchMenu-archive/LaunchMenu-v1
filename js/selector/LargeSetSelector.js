/*global Class Selector $ SelectorItem, $EventHandler*/
loadOnce("Selector");
loadOnce("/$EventHandler");
window.LargeSetSelector = class LargeSetSelector extends Selector{
    __initVars(){
        super.__initVars();
    
        this.dataSet = [];              //the set of data that will be displayyed
        this.selectorItemHeight = 0;    //the general height that items will have
        this.selectedIndex = 0;         //the item index that is currently selected
        this.listTemplate = {
            html:   `<div class=content></div>`,
            style:  `c-scroll&.content{
                        position: relative
                    }`
        }
    }
    //html element methods
    __initHtml(){
        var t = this;
        var lastOffset = 0;
        this.$("c-scroll")[0].setScrollListener(function(hOffset, vOffset){
//            console.log(this.getVerticalOffset());
//            console.log(lastOffset-vOffset);
            if(Math.abs(lastOffset-vOffset)>60){ //update the element, but not too often
                t.__loadElements();
                lastOffset = vOffset;
            }
//            this.setVerticalOffset(vOffset);
  
            //indicate that the list is being scrolled through, used by the selector items to block item selection while scrolling
            t.scrolling = true;
            clearTimeout(t.scrollingTimeout);
            t.scrollingTimeout = setTimeout(function(){
                t.scrolling = false;
            },200);
        });
        this.__refreshListSize();
    }

    //events that can be tapped into
    __createItem(item){                     //fires to create the item from the dataset items
        return new SelectorItem(item);
    }
    
    
    //disable some methods from Selector because an entire dataset should be passed instead of individual items
    addItem(item){
        throw new Error("You can only use setDataSet() to define the items when using the LargeSetSelector");
    }
    __insertItemElement(element){}
    
    //data set methods
    setDataSet(list){
        if(!(list instanceof Array)){
            throw new Error("the first argument should be an array of objects");
        }
        if($EventHandler.trigger("setDataSet:pre", this, {dataSet:list})){
            var items = this.$("c-scroll&.content").children();
            for(var i=0; i<items.length; i++){ //remove all currently loaded items
                items[i].selectorItem.__destroy(); 
            }
            
            this.dataSet = list;
            if(this.dataSet.length>0){
                //get the general item height based on the first item in the list
                var item = this.__createItem();
                $("body").append(item.element);
                this.selectorItemHeight = item.element.height();
                item.element.remove();
            }else{
                this.selectorItemHeight = 0;
            }
            
            //set the content height based on the item height and the number of items
            //the content height might be different from this estimate, because the item height can differ
            //but this will be accounted for when loading those items
            this.$("c-scroll&.content").height(this.selectorItemHeight*this.dataSet.length);
            
            // load elements from the dataset, this will also select the selectedIndex;
            this.selectedIndex = 0;
            this.__loadElements();

            this.$("c-scroll")[0].updateSize(true, true);
            
            $EventHandler.trigger("setDataSet:post", this, {dataSet:list});
            return true;
        }
        return false;
    }
    __loadElements(){
        var scroll = this.$("c-scroll");
        var verticalOffset = scroll[0].getVerticalOffset();
        if($EventHandler.trigger("loadElements:pre", this, {verticalOffset: verticalOffset})){
            var items = scroll[0].$(".content").children();
            var scrollTop = scroll.offset().top;
            var height = scroll.height();
            
            //find the things that are outside of the element range
            var removeItems = [];
            for(var i=0; i<items.length; i++){
                var item = $(items[i]);
                if(item.offset().top>scrollTop+1.5*height) //item is above loading region
                    removeItems.push(items[i].selectorItem);
            }
            
            //remove the files
            for(var i=0; i<removeItems.length; i++){
                var item = removeItems[i];
                this.__removeItem(item);
            }
               
            insertEnd:{
                //find first index to insert items from at the end of the set
                items = scroll[0].$(".content").children();
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
                
                //insert the necessary items at the end of the set
                while(itemIndex<this.dataSet.length){
                    if(this.$("#"+itemIndex).length==0){//don't load the item if it is already on the page for some reason
                        var selectorItem = this.__createItem(this.dataSet[itemIndex]);
                        var el = selectorItem.element;
                        this.__insertItem(selectorItem, itemIndex++);
                        if(el.offset().top>scrollTop+1.2*height) break; //stop loading items when enough are loaded
                    }else
                        itemIndex++;
                }
            }
            
            $EventHandler.trigger("loadElements:post", this, {verticalOffset: verticalOffset});
            return true;
        }
        return false;
    }
    __insertItem(selectorItem){
        var content = this.$("c-scroll&.content");
        var index = content.children().length;
        if($EventHandler.trigger("insertItem:pre", this, {item:selectorItem, index:index})){
            selectorItem.__setSelector(this);
            if(index==this.selectedIndex)   //select the item if this item was previously selected and unloaded because it went outside the visible range
                selectorItem.select();
            
            //insert the element
            var element = selectorItem.element;
            element.attr("ID", index); 
            content.append(element);
            
            //update the content height if the height did not match the general selectorItemHeight
            var deltaHeight = element.height()-this.selectorItemHeight;
            if(deltaHeight!=0)
                this.__alterContentHeight(deltaHeight);
            
            $EventHandler.trigger("insertItem:post", this, {item:selectorItem, index:index});
            return true;
        }
        return false;
    }
//    __insertItem(selectorItem, index){
//        if($EventHandler.trigger("insertItem:pre", this, {item:selectorItem, index:index})){
//            var items = this.$("c-scroll&.content").children();
//            var element = selectorItem.element;
//            element.attr("ID",index);       //store the index in the id of the element
//            selectorItem.__setSelector(this); //make sure the selectorItem has a reference to the selector
//            if(index==this.selectedIndex)   //select the item if this item was previously selected and unloaded because it went outside the visible range
//                selectorItem.select();
//            var prevFirstItem = $(items[0]);
//            
//            add:{ 
//                //check if there are elements to inser the item relative to
//                if(items.length>0){
//                    //check the first three higher and lower ids if they can be found to place relative to that
//                    for(var i=0; i<3; i++){
//                        var n;
//                        if((n = items.filter("#"+(index+i))).length>0){
//                            element.insertBefore(n);
//                            break add;
//                        }
//                        if((n = items.filter("#"+(index-i))).length>0){
//                            element.insertAfter(n);
//                            break add;
//                        }
//                    }
//                    //find the closest id to place relative to
//                    var distance = 10000;
//                    var closest = null;
//                    for(var i=0; i<items.length; i++){
//                        var item = $(items[i]);
//                        var delta = Math.abs(Number(item.attr("ID"))-index);
//                        if(delta<distance){
//                            distance = delta;
//                            closest = item;
//                        }
//                    }
//                    if(closest){
//                        if(Number(closest.attr("ID"))>index){
//                            element.insertBefore(closest);
//                        }else{
//                            element.insertAfter(closest);     
//                        }
//                        break add;
//                    }
//                }else{
//                    this.$("c-scroll&.content").append(element);
//                    break add;
//                }
//                
//                //there is no real reason this code should be reached
//                element.attr("ID","");
//                return;
//            }
//            
//            // update the content height if the height did not match the general selectorItemHeight
//            var deltaHeight = element.height()-this.selectorItemHeight;
//            if(deltaHeight!=0)
//                this.__alterContentHeight(deltaHeight);
//            
//            //set the margin at the top if this is the new highest item in the list
//            if(element.index()==0){
//                prevFirstItem.css({"margin-top":0}).removeClass("first");
//                element.css({"margin-top":index*this.selectorItemHeight+"px"}).addClass("first");   
//            }
//            
////            console.log(this.$("c-scroll&.content").height());
//            $EventHandler.trigger("insertItem:post", this, {item:selectorItem, index:index});
//            return true;
//        }
//        return false;
//    }
    __removeItem(selectorItem){
        if($EventHandler.trigger("removeItem:pre", this, {item:selectorItem})){
            var element = selectorItem.element;
            
//            //set the second item to be the new highest item, if this item was the highest item
//            if(element.is(".first")){
//                var el = element.next();
//                if(el)
//                    el.css("margin-top",this.selectorItemHeight*Number(el.attr("ID"))).addClass("first");
//            }
            //set selectedItem to null if this was the selected item
            if(selectorItem == this.selectedItem){
                this.selectedItem = null;
            }
            
            //update the content height if this height was not the same as the general selectorItemHeight
            var deltaHeight = element.height()-this.selectorItemHeight;
            if(deltaHeight!=0)
                this.__alterContentHeight(-deltaHeight);
                
            //destroy the object, (should destroy the html element)
            selectorItem.__destroy();
            
            $EventHandler.trigger("removeItem:post", this, {item:selectorItem});
            return true;
        }
        return false;
    }
    __alterContentHeight(delta){     //fires to update the placeholder content height, when and item didn't correspont with the expected item height
        var c = this.$("c-scroll&.content");
        //change the height of content, because an item's height might not have been the general selectorItemheight
        //animate the height change, so it is smoother and less noticeable
        var d = 0;
        $({d:0}).animate({d:delta}, {easing:"linear", duration:50, step:function(now){
            now = Math.floor(now);
            var del = now-d;
            c.height(c.height()+del);
            d = now;
        }});
    }
    
    //override selecting methods 
    selectItem(selectorItem){
        //set the selected index when selecting an item, so it can be reselected after being unloaded because it fell outside the visible item range
        
        if($EventHandler.trigger("selectItem:pre", this, {item:selectorItem})){
            $EventHandler.disableEvents();
            
            if(super.selectItem(selectorItem)){
                this.selectedIndex = Number(selectorItem.element.attr("ID"));
                
                $EventHandler.enableEvents();
                $EventHandler.trigger("selectItem:post", this, {item:selectorItem});
                return true;
            }
        }
        return false;
    }
    selectUp(){
        if(this.selectedItem){ //select up as per usual
            return super.selectUp();
        }else{
            //scroll to the position of the selected item, because it has been unloaded
            var scroll = this.$("c-scroll");
            scroll[0].focusVertical((this.selectedIndex-1)*this.selectorItemHeight,200);
            return true;
        }
    }
    selectDown(){
        if(this.selectedItem){ //select up as per usual
            return super.selectDown();
        }else{
            //scroll to the position of the selected item, because it has been unloaded
            var scroll = this.$("c-scroll");
            scroll[0].focusVertical((this.selectedIndex-1)*this.selectorItemHeight,200);
            return true;
        }
    }
}