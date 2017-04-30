/*global Class Selector $ SelectorItem*/
var LargeSetSelector = Class("LargeSetSelector", {
    const: function(){
        this.super.const();
        this.dataSet = [];
        this.selectorItemHeight = 0;
    },
    htmlInitialisation: function(){
        this.$(".list").scrollbar({scrollListener: function(offset){
            
        }});
        this.refreshListSize();
    },
    insertItemElement: function(element){},
    setDataSet: function(list){
        if(!(list instanceof Array)){
            throw new Error("the first argument should be an array of objects");
        }
        this.$(".content").first().children().remove();
        this.dataSet = list;
        if(this.dataSet.length>0){
            var item = list[0];
            $("body").append(item.element);
            this.selectorItemHeight = item.element.height();
            item.element.remove();
        }else{
            this.selectorItemHeight = 0;
        }
        this.$(".content").height(this.selectorItemHeight*this.dataSet.length);
    },
    insertSelectorItem: function(SelectorItem, index){
        var items = this.$(".content").children();
        var element = SelectorItem.element;
        element.attr("ID",index);
        var firstItem = $(items[0]);
        
        add:{ 
            if(items.length>0){
                for(var i=0; i<3; i++){
                    if(items.filter("#"+(index+i)).length>0){
                        element.insertAfter(items.filter("#"+(index+i)));
                        break add;
                    }
                    if(items.filter("#"+(index-i)).length>0){
                        element.insertAfter(items.filter("#"+(index-i)));
                        break add;
                    }
                }
                var distance = 10000;
                var closest = null;
                for(var i=0; i<items.length; i++){
                    var item = $(items[i]);
                    var delta = Math.abs(Number(item.attr("ID")));
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
                    console.log(closest, element);
                    break add;
                }
            }else{
                this.$(".content").append(element);
                break add;
            }
            element.attr("ID","");
            return;
        }
        
        var deltaHeight = element.height()-this.selectorItemHeight;
        if(deltaHeight!=0)
            this.alterContentHeight(delta);
        
        var listIndex = element.index();
        if(listIndex==0) element.css({position:"absolute",top:index*this.selectorItemHeight});
        firstItem.css({position:"relative",top:0});
    },
    removeSelectorItem: function(SelectorItem){
        
    },
    alterContentHeight: function(delta){
        var c = this.$(".content");
        c.height(c.height()+delta);
    },
    createSelectorItem: function(item){
        return new SelectorItem(item);
    },
    addItem: function(item){
        throw new Error("You can only use setDataSet() to define the items when using the LargeSetSelector");
    },
    listTemplate:{
        html:   `<div class=content></div>`,
        style:  ``
    },
}, Selector);