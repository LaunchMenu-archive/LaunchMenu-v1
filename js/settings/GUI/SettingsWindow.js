loadOnce("/window/Window");
$ScriptLoader.setLocation("/settings/GUI/elements/");
loadOnce("SettingsCategoryElement");
loadOnce("SettingsContainerElement");
loadOnce("/styling/IconElement");
loadOnce("HelpOverlay");
window.SettingsWindow = class SettingsWindow extends Window{
    constructor(){
        super(function(){ //alter template before it is initialized
            this.contentTemplate.style = this.contentTemplate.style
                .replace(/_MINWIDTH_/g, this.minSettingsWidth).replace(/_MINHEIGHT_/g, this.minSettingsHeight);
        });
        
        var t = this;
        //set up help overlay
        this.helpOverlay = new HelpOverlay();
                
        
        //create settings container, and setup value error handler, and help message handler
        this.settingsContainer = new SettingsContainerElement(function(error, value){
            if(error)
                t.setErrorMessage(error.message);
            else
                t.setErrorMessage(); //reset error message
        }, function(data, args){
            t.helpOverlay.openHelpData(data, args);
        }, true);
        $(this.settingsContainer).addClass(this.htmlClassName);
        this.$(".settings").prepend(this.settingsContainer);
        
        //make sure the settings element changes size when the settings container does
        this.settingsContainer.__onSizeChange = function(width, height){
            t.$(".settings").css("min-width", Math.max(width, t.minSettingsWidth));
            if(!t.updatingSize){
                t.updatingSize = true;
                t.__updateSize();
                delete t.updatingSize;
            }
        }
        
        //load the setting categories into the container
        SettingsCategoryElement.createCategoryContainer(this.$(".navigator"), $Settings, this.__categorySelected.bind(this));
    }
    __initVars(){
        super.__initVars();

        this.minSettingsWidth = 300;
        this.minSettingsHeight = 200;
        this.contentTemplate = {
            html:   `<div class='navigator f0'>
            
                    </div
                    ><div class='settings bg4 f0'>
                        <div class='errorBar errorBackground2 bd4'>
                            <div class='errorContainer errorBorder0 errorFont0'>
                                <c-icon src='resources/images/icons/status icons/error.png' size=16></c-icon>
                                <span class='errorMessage'>
                                </span>
                            </div>
                        </div>
                    </div>`,
            style:  `.root{
                        white-space: nowrap;
                    }
                    .navigator{
                        height: calc(100% - 10px);
                        padding: 5px;
                        padding-left: 10px;
                        width: fit-content;
                        
                        display: inline-block;
                        vertical-align: top;
                        overflow: hidden;
                    }
                    .settings{
                        min-width: _MINWIDTH_px;
                        min-height: _MINHEIGHT_px;
                        width: _MINWIDTH_px;
                        height: _MINHEIGHT_px;

                        box-shadow: inset 2px 2px 2px rgba(0,0,0,0.3);
                        display: inline-block;
                        vertical-align: top;
                    }
                    
                    
                    .errorBar{
                        position: relative;
                        left: 0;
                        width: 100%;
                        
                        white-space: normal;
                        border-left-width: 1px;
                        opacity: 0;
                        transition: opacity 200ms;
                        padding-bottom: 50px;
                    }
                    .errorBar .errorContainer{
                        position: relative;
                        z-index: 1;
                        border-top-width: 1px;
                        padding: 2px;
                    }`
        };
    }
    __initHtml(){
        var t = this;
        //make sure the settings element fills the window, even if the navigator expands it
        var settings = t.$(".settings");
        var navigatorResizeListener = new ResizeSensor(this.$(".navigator")[0], function(){
            var padding = parseFloat(settings.css("padding-top"))+parseFloat(settings.css("padding-bottom"));
            settings.css("min-height", Math.max(t.$(".navigator").outerHeight(true), t.minSettingsHeight)- padding);            
        });
    }
    __onWidthChange(newWidth, oldWidth){
        if(this.errorMessage && this.errorMessage.length>0)
            this.setErrorMessage(this.errorMessage, true);
        this.settingsContainer.__sendSizeChangeUpdate();
    }
    __onHeightChange(newHeight, oldHeight){
        //update the scrollbar size
        this.settingsContainer.scrollContainer.updateSize(true);
    }
    
    __categorySelected(categoryElement){
        var category = categoryElement.category;
        
        this.settingsContainer.openCategory(category);
    }
    setErrorMessage(message, overwrite){
        var textContainer = this.$(".errorMessage");
        if(message!=this.errorMessage || overwrite){
            var t = this;
            var sb = this.$(".errorBar");
            var sc = this.$("c-settings-container");
            
            var transitionTime = 200;
            this.errorMessage = message;
            
            if(this.errorBarTransition)
                this.errorBarTransition.stop();
            else
                this.errorBarTransition = $({opacityV: 0, heightV:0}); 
            
            var data;
            if(message && message.length>0){
                textContainer.text(message);
                data = {opacityV: 1, heightV:this.$(".errorContainer").outerHeight(true)};
            }else{
                data = {opacityV: 0, heightV:0};
            }
            
            this.errorBarTransition.animate(data, {step: function(n, data){
                if(data.prop=="opacityV") sb.css("opacity", data.now);
                else  sc.css("height", "calc(100% - "+data.now+"px)");
//                t.$("c-settings-container&c-scroll")[0].updateSize();
            }, duration: transitionTime});
        }
    }
    
    __startResizing(side){
        //reset the actual css width and height, so the mouse connects at the right point
        var dim = {left:"width",right:"width", top:"height", bottom:"height"}[side];
        this.$(".settings")[dim](this.$(".settings")[dim]());
    }
    __resizeSide(side, delta){ //the function that gets called by the dragging of the resize elements
        var s = this.$(".settings");
        if(side=="right" || side=="left"){
            var oldWindowWidth = this.element.width();
            var oldWidth = s.width();
            
            //we use the width css instead of the actual width, so the mouse doesn't become offset.
            //if we use the real width, and we go past the minimum size and move back, the mouse would have an offset
            var width;
            var m;
            if(s.attr("style") && (m=s.attr("style").match(/(?:^|;)\s*width:\s*(-?[0-9]+)px/)))
                width = parseInt(m[1]); //get actual css width, instead of the element width
            else
                width = oldWidth;
            
            s.width(Math.floor(width+delta));

            this.__onWidthChange(this.element.width(), oldWindowWidth);
            if(oldWidth==s.width()) return;
        }else if(side=="bottom" || side=="top"){
            var oldWindowHeight = this.element.height();
            var oldHeight = s.height();
            
            var height;
            var m;
            if(s.attr("style") && (m=s.attr("style").match(/(?:^|;)\s*height:\s*(-?[0-9]+)px/)))
                height = parseInt(m[1]); //get actual css height, instead of the element height
            else
                height = oldHeight;
            
            s.height(Math.floor(height+delta));
            
            this.__onHeightChange(this.element.height(), oldWindowHeight);
            if(oldHeight==s.height()) return;
        }
        
        if(side=="left"){
            this.element.css({left:parseInt(this.element.css("left"))-delta});
        }else if(side=="top"){
            this.element.css({top:parseInt(this.element.css("top"))-delta});
        }
    }
};