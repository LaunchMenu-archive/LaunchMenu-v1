loadOnce("../../BaseElement");
loadOnce("/styling/IconElement");
window.OptionManagerOptionElementClass = class OptionManagerOptionElementClass extends BaseElementClass{
    constructor(index, option, optionManagerWindow){
        super();
        $(this).addClass("bd0");
        this.$(".title").text(option[0]);
        this.option = option;
        this.index = index;
        this.ID = option[1];
        this.optionManagerWindow = optionManagerWindow;
    }
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<div class='title f0'></div
                    ><div class='delete f0 bg4H'>
                        <c-icon type=cross></c-icon>
                    </div>`,
            style: `.root{
                        height: 20px;
                        width: 100%;
                        border-bottom-width: 1px;
                        cursor: pointer;
                    }
                    .title{
                        width: calc(100% - 35px);
                        height: 100%;
                        display: inline-block;
                        vertical-align: top;
                        padding-left: 5px;
                        padding-right: 5px;
                        
                        overflow: hidden;
                        text-overflow: ellipsis;
                        word-break: break-all;
                        white-space: nowrap; 
                    }
                    .delete{
                        width: 17px;
                        height: 100%;
                        display: inline-block;
                        vertical-align: top;
                        text-align: left;
                        padding-left: 3px;
                    }
                    c-icon{
                        line-height: 20px;
                    }`
        }
    }
 
    __initHtml(){
        super.__initHtml();
        
        //set up events
        var t = this;
         
        //select event
        this.$(".title").mouseup(function(){
            if(!cursorSet && !t.selected){
                t.optionManagerWindow.__selectOption(t);
            }
        });
        
        //reorder event
        this.dragging = false;
        var cursorSet = false;
        var getEventDir = function(e){
            return Math.round( (e.pageY-($(t).offset().top + $(t).height()/2)) /$(t).height() );
        }
        this.$(".title").mousedown(function(){ //element listener
            t.dragging = true;
            cursorSet = false;
            $Utils.disableTextSelection(true);
        })
        
        //window listeners for reorder event
        this.mouseupListener = function(){
            t.dragging = false;
            $Utils.disableTextSelection(false);
            $Utils.setCursor();
            t.$(".title").css("cursor", "pointer");
        };
        var lastMouseEvent;
        this.mousemoveListener = function(e){
            lastMouseEvent = e;
            if(t.dragging){
                var dir = getEventDir(e);
                if(dir!=null && !cursorSet){ //only change cursor once actual dragging has taken place
                    $Utils.setCursor("n-resize");
                    t.$(".title").css("cursor", "n-resize");
                    cursorSet = true;
                }    
                t.move(dir);
            }
        };
        this.parentScrollListener = function(){
            if(t.dragging){
                var dir = getEventDir(lastMouseEvent);
                t.move(dir);
            }
        }
        this.UID = Math.ceil(Math.random()*Math.pow(10, 7));
        
        //delete event
        this.$(".delete").click(function(){
            if($(t).parent().find("c-option-manager-option").length>1){ //only remove if it isn't the only option left
                var options = $(t).parent().find("c-option-manager-option");
                $(t).remove();                
                t.optionManagerWindow.selectedElement.__updateIndexes();
                
                if(t.selected){
                    var el;
                    options.each(function(){
                        if(this!=t)
                            el = this;
                    });
                    t.optionManagerWindow.__selectOption(el);
                }
                
                t.optionManagerWindow.__deleteOption(t);
            }
        });
    }
    connectedCallback(){
        document.addEventListener("mouseup", this.mouseupListener);
        document.addEventListener("mousemove", this.mousemoveListener);
        $(this).closest(".scrollElement").on("scroll."+this.UID, this.parentScrollListener);
    }
    disconnectedCallback(){
        document.removeEventListener("mouseup", this.mouseupListener);
        document.removeEventListener("mousemove", this.mousemoveListener);
        $(this).closest(".scrollElement").off("scroll."+this.UID); 
    }
    move(dir){
        var t = this;
        if(dir!=0){
            var options = $(this).parent().find("c-option-manager-option");
            var oldIndex = this.index;
            
            //move to new index
            var i = 0;
            if(this.index+dir==0){ //insert in front if new index==0
                $(this).parent().prepend(this);
            }else{ //insert behind element with an index of new index-1
                if(dir<0) dir--;
                options.each(function(){
                    if(i++ == t.index+dir){
                        $(t).insertAfter($(this));
                    }
                });
            }
            
            //set new indices of elements
            this.__updateIndexes();
            
            //send change
            if(this.index!=oldIndex)
                this.optionManagerWindow.__moveOption(t, oldIndex);
        }
    }
    __select(){
        if(!this.selected){
            this.selected = true;
        }
    }
    __deselect(){
        if(this.selected){
            this.selected = false;
        }
    }
    __updateIndexes(){
        var options = $(this).parent().find("c-option-manager-option");
        var i = 0;
        options.each(function(){
            this.index = i++;
            if(this.selected){
                this.optionManagerWindow.__selectOption(this);
            }
        });
    }
    setOptionText(optionText){
        this.option[0] = optionText;
        this.$(".title").text(optionText);
    }
};
window.OptionManagerOptionElementClass.registerElement();