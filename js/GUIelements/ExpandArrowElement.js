loadOnce("BaseElement");
window.ExpandArrowElementClass = class ExpandArrowElementClass extends BaseElementClass{
    constructor(colorClass, listener, clickToggle, width, height, collapsedDir, expandedDir){
        super(function(){
            this.clickToggle = clickToggle||this.attr.clicktoggle!==undefined;
        });
        
        if(colorClass){
            if(typeof colorClass == "number")
                this.c = "border"+colorClass;
            else
                this.c = colorClass;
        }

        this.width = width||this.attr.width||this.attr.size||10;
        this.height = height||this.attr.height||this.attr.size||10;
        this.collapsedDir = collapsedDir||this.attr.collapsedDir||0;
        this.expandedDir = expandedDir||this.attr.expandedDir||1;
        this.listener = listener;
        
        $(this).css({"border-left-width": this.width+"px",
                    "border-top-width": this.height/2+"px",
                    "border-bottom-width": this.height/2+"px"});
        
        this.collapse(true, true);
    }
    __initVars(){
        super.__initVars();
        this.template = {
            html:  ``,
            style: `.root{
                        box-sizing: border-box;
                        border-top-color: transparent;
                        border-bottom-color: transparent;
                    }`
        }
        this.transitionTime = 200;
    }
    __initHtml(){
        super.__initHtml();
        if(this.c)
            $(this).addClass(this.c);

        if(this.clickToggle)
            $(this).click(function(){
                this.toggle();
            }).css("cursor", "pointer");
    }
    
    //listeners setup
    setListener(listener){
        this.listener = listener;
    }
    setFinishedExpandingListener(listener){
        this.finishedListener = listener;
    }
    
    //collapse/expand methods
    expand(instant, noCallback){
        var t = this;
        if(!this.expanded){
            this.expanded = true;
            if(this.listener && !noCallback)
                this.listener.call(this, this.expanded);
            
            //execute rotation animation, and sent callback when finished
            $({deg:this.collapsedDir*90}).animate({deg:this.expandedDir*90}, {duration:instant?0:this.transitionTime, step:function(now){
                $(t).css("transform", "rotate("+Math.floor(now)+"deg)");
            }, complete:function(){
                if(t.finishedListener && !noCallback)
                    t.finishedListener.call(t, true);
            }});
        }
    }
    isExpanded(){
        return this.expanded;
    }
    collapse(instant, noCallback){
        var t = this;
        if(this.expanded){
            this.expanded = false;
            if(this.listener && !noCallback)
                this.listener.call(this, this.expanded);
            
            //execute rotation animation, and sent callback when finished
            $({deg:this.expandedDir*90}).animate({deg:this.collapsedDir*90}, {duration:instant?0:this.transitionTime, step:function(now){
                $(t).css("transform", "rotate("+Math.floor(now)+"deg)");
            }, complete:function(){
                if(t.finishedListener && !noCallback)
                    t.finishedListener.call(t, false);
            }});
        }
    }
    toggle(){
        if(this.isExpanded())
            this.collapse();
        else
            this.expand();
    }
};
window.ExpandArrowElementClass.registerElement();