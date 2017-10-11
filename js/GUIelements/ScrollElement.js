loadOnce("BaseElement");
loadOnce("/$Utils");
loadOnce("/libraries/ResizeSensor");
window.ScrollElementClass = class ScrollElementClass extends BaseElementClass{
    constructor(properties){
        super();
        if(!(properties instanceof Object)) properties = {};
        this.vertical = this.attr.vertical!==undefined||properties.vertical;
        this.horizontal = this.attr.horizontal!==undefined||properties.horizontal;
        if(!this.vertical && !this.horizontal) this.vertical = true;
        this.padding = parseInt(this.attr.padding||properties.padding||0);
        this.fitContent = this.attr.fitcontent!==undefined||properties.fitContent;
        this.alwaysVisible = this.attr.alwaysvisible!==undefined||properties.alwaysVisible;
        this.fadeInDuration = parseInt(this.attr.fadeinduration||properties.fadeInDuration||0);
        this.fadeOutDuration = parseInt(this.attr.fadeoutduration||properties.fadeOutDuration||150);
        this.visibleDuration = parseInt(this.attr.visibleduration||properties.visibleDuration||1000);
        this.preventAutoScroll = this.attr.preventautoscroll!==undefined||properties.preventAutoScroll||false;
        this.customAutoScroll = this.attr.customautoscroll!==undefined||properties.customAutoScroll||false;
        this.autoScrollSpeed = parseInt(this.attr.autoscrollspeed||properties.autoScrollSpeed||2);
        this.dontUpdateOnResize = this.attr.dontupdateonresize!==undefined||properties.dontUpdateOnResize||false;
        this.focusXPer = parseFloat(this.attr.focusxper||properties.focusXPer||0.5);
        this.focusYPer = parseFloat(this.attr.focusyper||properties.focusYPer||0.5);
        this.focusDuration = parseInt(this.attr.focusduration||properties.focusDuration||200);
        this.minThumbSize = parseInt(this.attr.minthumbsize||properties.minThumbSize||30);
        if(this.customAutoScroll) this.preventAutoScroll = true;
        
        var n = $("<div style='overflow:scroll;width:0px;height:0px;box-sizing:content-box'></div>");
        $("body").append(n);
        this.realScrollbarWidth = -n.width();
        this.realScrollbarHeight = -n.height();
        n.remove();
        
        if(this.fitContent){
            $(this).css({
                "min-width": "100%",
                "min-height": "100%",
                "width": "fit-content",
                "height": "fit-content"});            
        }
        if(this.vertical){
            this.$(".scrollElement").height("100%");
            this.$(".scrollElement").css("overflow-y", "scroll");
            this.$(".vertical.scrollbar").css("display","block");
            this.$(".scrollContent").css("min-height", "0");
            if(!this.horizontal){                
                if(this.fitContent)
                    $(this).css("height","");
                else{
                    this.$(".scrollElement").width("100%");
                    this.$(".scrollContent").width("100%");
                }
            }
        }
        if(this.horizontal){
            this.$(".scrollElement").width("100%");
            this.$(".scrollElement").css("overflow-x", "scroll");
            this.$(".scrollContent").css("min-width", "0");
            this.$(".horizontal.scrollbar").css("display","block");
            if(!this.vertical){
                if(this.fitContent)
                    $(this).css("width","");
                else{
                    this.$(".scrollElement").height("100%");
                    this.$(".scrollContent").height("100%");
                }
            }
        }
        if(this.horizontal && this.vertical){
            this.$(".vertical.scrollbar").css("bottom",this.$(".horizontal.scrollbar").outerHeight());
            this.$(".horizontal.scrollbar").css("right",this.$(".vertical.scrollbar").outerWidth());
        }
        this.scrollElement = this.$(".scrollElement");
        this.scrollContent = this.$(".scrollContent");
        this.verticalThumb = this.$(".vertical .thumb");
        this.verticalBar = this.$(".vertical.scrollbar");
        this.horizontalThumb = this.$(".horizontal .thumb");
        this.horizontalBar = this.$(".horizontal.scrollbar");
        
        
        this.scrollListenerCallback = properties.scrollListener;
        this.resizeListenerCallback = properties.resizeListener;
        this.resizeContentListenerCallback = properties.resizeContentListener;
        //no longer needed after using box-sizing: border-box;
//        if(this.padding){ 
//            this.scrollContent.css({  "min-width":"calc(100% - "+(2*this.padding)+"px)",
//                                "min-height":"calc(100% - "+(2*this.padding)+"px)",
//                                "padding": this.padding+"px"});
//        }
        this.scrollContent.css("padding", this.padding);
    }
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<div class=scrollElement>
                        <div class=scrollContent>
                            _CHILDREN_
                        </div>
                    </div>
                    <div class="vertical scrollbar">
                        <div class='thumb bg4 bd0'></div>
                    </div>
                    <div class="horizontal scrollbar">
                        <div class='thumb bg4 bd0'></div>
                    </div>`,
            style: `.root{
                        position: relative;
                        overflow: hidden;
                        width: 100%;
                    }
                    .scrollElement{
                        overflow: hidden;
                    }
                    .scrollContent{
                        width: fit-content;
                        height: fit-content;
                        min-width: 100%;
                        min-height: 100%;
                        float: left;
                        box-sizing: border-box;
                    }
                    .scrollbar{
                        display: none;
                        position: absolute;
                        bottom: 0;
                        right: 0;
                    }
                    .thumb{
                        position: relative;
                        border-width: 1px;
                    }
                    
                    .vertical.scrollbar{
                        top: 0;
                        width: 10px;
                    }
                    .vertical .thumb{
                        width: 100%;
                        height: 50px;
                    }
                    
                    .horizontal.scrollbar{
                        left: 0;
                        height: 10px;
                    }
                    .horizontal .thumb{
                        height: 100%;
                        width: 50px;
                    }`
        };
    }
    
    //listening for property changes
    __initHtml(){
        var t = this;
        this.$(".scrollElement").scroll(function(){
            if(t.vertical) t.updateVerticalBarOffset();
            if(t.horizontal) t.updateHorizontalBarOffset();
        });
        this.$(".vertical .thumb").mousedown(function(event){
            t.verticalSelected = true;
            t.verticalStart = event.pageY - t.getVerticalBarOffset();
            $Utils.disableTextSelection(true);
        });
        this.$(".horizontal .thumb").mousedown(function(event){
            t.horizontalSelected = true;
            t.horizontalStart = event.pageX - t.getHorizontalBarOffset();
            $Utils.disableTextSelection(true);
        });
        
        this.$(".vertical.scrollbar").mouseenter(function(){
            t.verticalEnterTimeout = setTimeout(function(){
                t.setVerticalBarVisible(true, true);
            },30);
        }).mouseleave(function(){
            clearTimeout(t.verticalEnterTimeout);
            t.setVerticalBarVisible(false);
        });
        this.$(".horizontal.scrollbar").mouseenter(function(){
            t.horizontalEnterTimeout = setTimeout(function(){
                t.setHorizontalBarVisible(true, true);
            },30);
        }).mouseleave(function(){
            clearTimeout(t.horizontalEnterTimeout);
            t.setHorizontalBarVisible(false);
        });
    }
    

    //events that can be tapped into and altered
    __onResize(newWidth, newHeight, oldWidth, oldHeight){}           //fires when the element resizes
    __onContentResize(newWidth, newHeight, oldWidth, oldHeight){}    //fires when the content resizes
    __onScroll(vertical){}                                           //fires when scrolling
    
    connectedCallback(){
        var t = this;
        
        var oldContentWidth = 0;
        var oldContainerWidth = 0;
        var oldContentHeight = 0;
        var oldContainerHeight = 0;
        var resizeContentListener = function(){
            var newContentWidth = t.scrollContent.width();
            var newContentHeight = t.scrollContent.height();
            var newContainerWidth = t.scrollElement.width();
            var newContainerHeight = t.scrollElement.height();
            if(newContainerHeight!=oldContainerHeight || newContainerWidth!=oldContainerWidth){
                t.__onResize(newContainerWidth, newContainerHeight, oldContainerWidth, oldContainerHeight);
                if(t.resizeListenerCallback)
                    t.resizeListenerCallback(newContainerWidth, newContainerHeight, oldContainerWidth, oldContainerHeight);
            }
            if(newContentHeight!=oldContentHeight || newContentWidth!=oldContentWidth){
                t.__onContentResize(newContentWidth, newContentHeight, oldContentWidth, oldContentHeight);
                if(t.resizeContentListenerCallback)
                    t.resizeContentListenerCallback(newContainerWidth, newContainerHeight, oldContainerWidth, oldContainerHeight);
            }
            if(!t.dontUpdateOnResize){                
                t.updateSize();
            }
            if(t.vertical && (newContentHeight!=oldContentHeight || newContainerHeight!=newContainerHeight)) 
                t.updateVerticalBarHeight();
            if(t.horizontal && (newContentWidth!=oldContentWidth || newContainerWidth!=newContainerWidth))
                t.updateHorizontalBarWidth();
            oldContentWidth = newContentWidth;
            oldContentHeight = newContentHeight;
            oldContainerWidth = newContainerWidth;
            oldContainerHeight = newContainerHeight;
        } 
        
//        //create content change listener
//        this.observer = new MutationObserver(resizeContentListener);
//        var config = {childList:true, subtree:true};
//        this.observer.observe(this, config);
        
        //create size change listener
        this.scrollContentResizeListener = new ResizeSensor(this.$(".scrollContent")[0], resizeContentListener);
        this.resizeListener = new ResizeSensor(this, resizeContentListener);
        resizeContentListener();

        //auto scroll functions
        var verticalAutoScroll = function(){
            t.setVerticalOffset(t.getVerticalOffset()+t.verticalAutoScrollDir*t.autoScrollSpeed);
        };
        var horizontalAutoScroll = function(){
            t.setHorizontalOffset(t.getHorizontalOffset()+t.horizontalAutoScrollDir*t.autoScrollSpeed);
        };
        
        //drag listeners
        this.moveListener = function(event){
            if(t.verticalSelected){
                var offset = event.pageY-t.verticalStart
                offset = Math.max(0, Math.min(offset, t.getMaxVerticalBarOffset()));
                t.setVerticalBarOffset(offset);
            }
            if(t.horizontalSelected){
                var offset = event.pageX-t.horizontalStart
                offset = Math.max(0, Math.min(offset, t.getMaxHorizontalBarOffset()));
                t.setHorizontalBarOffset(offset);
            }
            //custom auto scroll
            if(t.dragging && t.customAutoScroll){
                var offset = $(t).offset();
                if(t.vertical){        
                    if(event.pageY<offset.top){
                        if(t.verticalAutoScrollDir!=-1)
                            t.verticalAutoScrollDir = -1;
                        if(!t.verticalScrollInterval)
                            t.verticalScrollInterval = setInterval(verticalAutoScroll, 20);
                    }else if(event.pageY>offset.top+$(t).height()){
                        if(t.verticalAutoScrollDir!=1)
                            t.verticalAutoScrollDir = 1;
                        if(!t.verticalScrollInterval)
                            t.verticalScrollInterval = setInterval(verticalAutoScroll, 20);
                    }else{
                        clearInterval(t.verticalScrollInterval);
                        t.verticalScrollInterval = null;
                    }
                }
                if(t.horizontal){        
                    if(event.pageX<offset.left){
                        if(t.horizontalAutoScrollDir!=-1)
                            t.horizontalAutoScrollDir = -1;
                        if(!t.horizontalScrollInterval)
                            t.horizontalScrollInterval = setInterval(horizontalAutoScroll, 20);
                    }else if(event.pageX>offset.left+$(t).width()){
                        if(t.horizontalAutoScrollDir!=1)
                            t.horizontalAutoScrollDir = 1;
                        if(!t.horizontalScrollInterval)
                            t.horizontalScrollInterval = setInterval(horizontalAutoScroll, 20);
                    }else{
                        clearInterval(t.horizontalScrollInterval);
                        t.horizontalScrollInterval = null;
                    }
                }
            }
        }
        this.mouseupListener = function(){
            t.verticalSelected = false;
            t.horizontalSelected = false;
            $Utils.disableTextSelection(false);
            t.dragging = false;
            
            //stop auto scrolling
            if(t.customAutoScroll){
                clearTimeout(t.verticalScrollInterval);
            }
        }
        
        //prevent auto scroll
        if(this.preventAutoScroll)
            this.scrollElement.mousedown(function(e){
                e.preventDefault();
                t.dragging = true;
            });
        
        $("body").mousemove(this.moveListener).mouseup(this.mouseupListener);
    }
    
    disconnectedCallback(){
        this.scrollContentResizeListener.detach(this.$(".scrollContent")[0]);
        this.resizeListener.detach(this);
        this.observer.disconnect();
        $("body").unbind("mousemove", this.moveListener).unbind("mouseup". this.mouseupListener);
    }
    
    //set listeners
    setScrollListener(listener){
        this.scrollListenerCallback = listener;
    }
    setResizeListener(listener){        
        this.resizeListenerCallback = listener;
    }
    setResizeContentListener(listener){        
        this.resizeContentListenerCallback = listener;
    }

    //modification methods
    append(element){
        this.$(".scrollContent").append(element);
    }
    prepend(element){
        this.$(".scrollContent").prepend(element);
    }
    
    //update the element sizing
    updateSize(updateScrollbar, overwriteSizeCheck){
        var se = this.scrollElement
        var c = this.scrollContent;
        
        //save scroll offset
        var horizontalOffset = se.scrollLeft();
        var verticalOffset = se.scrollTop();
        
        //set width
        var oldWidth = se.width(); 
        se.width(0);
        se.width(c.outerWidth(true)+(this.vertical?this.realScrollbarWidth:0));
        if(this.fitContent && !this.horizontal) $(this).width(se.width());

        var w = this.horizontal?
                $(this).width():
                Math.max($(this).width(),c.outerWidth(true));
        se.width(w +(this.vertical?this.realScrollbarWidth:0));
        if(this.fitContent && !this.horizontal) $(this).width(se.width());
        
        var newWidth = se.width();
        
        //set height
        var oldHeight = se.height();
        se.height(0);
        se.height(c.outerHeight(true)+(this.horizontal?this.realScrollbarHeight:0));
        if(this.fitContent && !this.vertical) $(this).height(se.height());

        var h = this.vertical?
                $(this).height():
                Math.max($(this).height(),c.outerHeight(true))
        se.height(h +(this.horizontal?this.realScrollbarHeight:0));
        if(this.fitContent && !this.vertical) $(this).height(se.height());
        
        var newHeight = se.height();
        
        //restore scroll offset
        se.scrollLeft(horizontalOffset);
        se.scrollTop(verticalOffset);
        
        if(updateScrollbar){
            if(this.vertical && (oldHeight!=newHeight || overwriteSizeCheck))
                this.updateVerticalBarHeight();
            if(this.horizontal && (oldWidth!=newWidth || overwriteSizeCheck))
                this.updateHorizontalBarWidth();
        }
    }
    
    //extra features
    focusVertical(element, duration){
        if(duration==null) duration=this.focusDuration;
        var y;
        if(typeof element=="number"){
            y = element;
        }else{
            var offset = element.position();
            y = offset.top+element.height()/2;
        }
        y -= this.focusYPer*$(this).height();
        
        clearInterval(this.focusVerticalInterval);
        
        var t = this;
        var startTime = Date.now();
        var cur = t.getVerticalOffset();
        this.focusVerticalInterval = setInterval(function(){
            var per = Math.min(1, (Date.now()-startTime)/duration);
            if(duration==0) per = 1;
            if(per>=1)
                clearInterval(t.focusVerticalInterval);
            
            var newY = per*(y-cur)+cur;
            t.setVerticalOffset(newY);
        });
    }
    focusHorizontal(element, duration){
        if(duration==null) duration=this.focusDuration;
        var x;
        if(typeof element=="number"){
            x = element;
        }else{
            var offset = element.position();
            x = offset.left+element.width()/2;
        }
        x -= this.focusXPer*$(this).width();
        
        clearInterval(this.focusHorizontalInterval);
        
        var t = this;
        var startTime = Date.now();
        var cur = t.getHorizontalOffset();
        this.focusHorizontalInterval = setInterval(function(){
            var per = Math.min(1, (Date.now()-startTime)/duration);
            if(duration==0) per = 1;
            if(per>=1)
                clearInterval(t.focusHorizontalInterval);
            
            var newX = per*(x-cur)+cur;            
            t.setHorizontalOffset(newX);
        });
    }
    focus(element, duration){
        if(element.x!=null && element.y!=null){
            this.focusVertical(element.y, duration);
            this.focusHorizontal(element.x, duration);
        }else{
            this.focusVertical(element, duration);
            this.focusHorizontal(element, duration);
        }
    }
    
    //vertical get methods
    getVerticalOffset(){
        return this.scrollElement.scrollTop();
    }
    getMaxVerticalOffset(){
        return Math.max(this.scrollContent.outerHeight(true)-this.scrollElement.height(),0);
    }
    getVerticalPercentage(){ 
        var max = this.getMaxVerticalOffset();
        return max<=0?0:this.getVerticalOffset()/max;
    }
    getVerticalBarOffset(){
        return this.getVerticalPercentage()*this.getMaxVerticalBarOffset();
    }
    getMaxVerticalBarOffset(){
        return this.verticalBar.height()-this.verticalThumb.outerHeight(true);
    }
    //vertical set methods
    setVerticalOffset(val){
        if(!this.changeVerticalOffset){
            this.changeVerticalOffset = true //prevent recursion;
            
            this.scrollElement.scrollTop(val);
            this.setVerticalBarOffset(this.getVerticalPercentage()*this.getMaxVerticalBarOffset());
            
            delete this.changeVerticalOffset;
        }
    }
    setVerticalPercentage(val){
        this.setVerticalBarOffset(val*this.getMaxVerticalBarOffset());
    }
    setVerticalBarOffset(val, dontUpdateOffset){
        if(!this.changeVerticalBarOffset){
            this.changeVerticalBarOffset = true //prevent recursion;
            
            this.setVerticalBarVisible(true);
            
            this.verticalThumb.css({"top":val});
            if(!dontUpdateOffset)
                this.setVerticalOffset(val/this.getMaxVerticalBarOffset()*this.getMaxVerticalOffset());
            if(this.scrollListenerCallback)
                this.scrollListenerCallback(0, this.getVerticalOffset());
            
            delete this.changeVerticalBarOffset;
        }
    }
    setVerticalBarHeight(val){
        var d = this.verticalThumb.outerHeight(true)-this.verticalThumb.height(); //compensate for styling around element
        this.verticalThumb.height(Math.min(this.verticalBar.height(),val)-d);
        this.updateVerticalBarOffset();
        if(this.verticalBar.height()==val)
            this.verticalBar.stop().css("opacity", 0);
    }
    updateVerticalBarOffset(){
        this.setVerticalBarOffset(this.getVerticalPercentage()*this.getMaxVerticalBarOffset(), true);
    }
    updateVerticalBarHeight(){
        var cHeight = Math.max(this.scrollElement.height(), this.scrollContent.outerHeight(true));
        var barHeight = this.verticalBar.height()*this.scrollElement.height()/cHeight;
        this.setVerticalBarHeight(Math.max(this.minThumbSize, barHeight));
    }
    setVerticalBarVisible(val, dontHide){
        clearTimeout(this.resetVerticalVisible);
        var t = this;
        var canScroll = this.getMaxVerticalOffset()>0;
        if(val && canScroll){
            this.verticalBar.show();
            this.verticalBar.stop().animate({opacity:1}, {duration:this.fadeInDuration});
            if(!this.alwaysVisible && !dontHide){
                this.resetVerticalVisible = setTimeout(function(){
                    t.setVerticalBarVisible(false);
                }, this.visibleDuration);
            }
        }else{
            this.verticalBar.stop().animate({opacity:0}, {duration:this.fadeOutDuration});
        }
    }

    
    //horizontal get methods
    getHorizontalOffset(){
        return this.scrollElement.scrollLeft();
    }
    getMaxHorizontalOffset(){
        return Math.max(this.scrollContent.outerWidth(true)-this.scrollElement.width(),0);
    }
    getHorizontalPercentage(){ 
        var max = this.getMaxHorizontalOffset();
        return max<=0?0:this.getHorizontalOffset()/max;
    }
    getHorizontalBarOffset(){
        return this.getHorizontalPercentage()*this.getMaxHorizontalBarOffset();
    }
    getMaxHorizontalBarOffset(){
        return this.horizontalBar.width()-this.horizontalThumb.outerWidth(true);
    }
    //horizontal set methods
    setHorizontalOffset(val){
        if(!this.changeHorizontalOffset){
            this.changeHorizontalOffset = true //prevent recursion;
            
            this.scrollElement.scrollLeft(val);
            this.setHorizontalBarOffset(this.getHorizontalPercentage()*this.getMaxHorizontalBarOffset());
            
            delete this.changeHorizontalOffset;
        }
    }
    setHorizontalPercentage(val){
        this.setHorizontalBarOffset(val*this.getMaxHorizontalBarOffset());
    }
    setHorizontalBarOffset(val, dontUpdateOffset){
        if(!this.changeHorizontalBarOffset){
            this.changeHorizontalBarOffset = true //prevent recursion;
            
            this.setHorizontalBarVisible(true);
            
            this.horizontalThumb.css({"left":val});
            if(!dontUpdateOffset)
                this.setHorizontalOffset(val/this.getMaxHorizontalBarOffset()*this.getMaxHorizontalOffset());
            if(this.scrollListenerCallback)
                this.scrollListenerCallback(this.getHorizontalOffset(), 0);
            
            delete this.changeHorizontalBarOffset;
        }
    }
    setHorizontalBarWidth(val){
        var d = this.horizontalThumb.outerWidth(true)-this.horizontalThumb.width(); //compensate for styling around element
        this.horizontalThumb.width(Math.min(this.horizontalBar.width(),val)-d);
        this.updateHorizontalBarOffset();
        if(this.verticalBar.width()==val)
            this.verticalBar.stop().css("opacity", 0);
    }
    updateHorizontalBarOffset(){
        this.setHorizontalBarOffset(this.getHorizontalPercentage()*this.getMaxHorizontalBarOffset(), true);
    }
    updateHorizontalBarWidth(){
        var cWidth = Math.max(this.scrollElement.width(), this.scrollContent.outerWidth(true));
        var barWidth = this.horizontalBar.width()*this.scrollElement.width()/cWidth;
        this.setHorizontalBarWidth(Math.max(this.minThumbSize, barWidth));
    }
    setHorizontalBarVisible(val, dontHide){
        clearTimeout(this.resetHorizontalVisible);
        var t = this;
        var canScroll = this.getMaxHorizontalOffset()>0;
        if(val && canScroll){
            this.horizontalBar.show();
            this.horizontalBar.stop().animate({opacity:1}, {duration:this.fadeInDuration});
            if(!this.alwaysVisible && !dontHide){
                this.resetHorizontalVisible = setTimeout(function(){
                    t.setHorizontalBarVisible(false);
                }, this.visibleDuration);
            }
        }else{
            this.horizontalBar.stop().animate({opacity:0}, {duration:this.fadeOutDuration});
        }
    }
}
window.ScrollElementClass.registerElement();