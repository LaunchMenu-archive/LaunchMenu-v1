loadOnce("/libraries/scrollbar");
loadOnce("/GUIelements/BaseElement");
loadOnce("/GUIelements/ScrollElement");
loadOnce("/$Utils");
loadOnce("$SettingElementTypesHandler");
window.SettingsContainerElementClass = class SettingsContainerElementClass extends BaseElementClass{
    constructor(invalidValueFunc, helpMessageFunc, expandable){
        super();
        this.categoryChildrenListener = [];
        this.openedCategories = [];
        this.stopOpeningCategoryFunctions = [];
        
        this.invalidValueFunc = invalidValueFunc;
        this.helpMessageFunc = helpMessageFunc;
    }
    __initVars(){
        super.__initVars();
        this.template = {
                html: `<c-scroll fitContent padding=10 class=container></c-scroll>`,
                style:`.root{
                            width: fit-content;
                            min-width: 100%;
                            height: 100%;
                        }
                        .container{
                            height: 100%;
                        }
                        c-scroll&.vertical.scrollbar{
                            width: 8px;
                        }`
        }
    }
    __initHtml(){
        this.scrollContainer = this.$(".container")[0];
        this.$("c-scroll&.vertical.scrollbar .thumb").removeClass("bg4 bd0").addClass("bg0 bd2");
    }
    
    //events that can easily be tapped into and altered
    __onSizeChange(width, height, oldWidth, oldHeight){}    //fires when the setting elements forced the container size to change
    
    
    //size change methods
    connectedCallback(){ //add the resize sensor when the element is added to the document, it doesn't work when added before
        var t = this;
        this.resizeSensor = new ResizeSensor(this, function(){
            if(!t.resizing){ //stop recursion, as this method will also alter the content size
                t.resizing = true;
                
                t.__sendSizeChangeUpdate();
                
                delete t.resizing;
            }
        });
    }
    disconnectedCallback(){ //dispose all listeners when disconnected from the document
        this.resizeSensor.detach(this);
        //dispose the category children listener
        if(this.categoryChildrenListener)
            this.selectedCategory.removeChildrenListener(this.categoryChildrenListener);
    }
    __sendSizeChangeUpdate(){
        //set the settings to their true width, instead of the width they copy from their parent
        this.__setSettingsToTrueWidth(true);
        var newWidth = $(this).width();
        var newHeight = $(this).height();
        if(newWidth!=this.oldWidth || newHeight!=this.oldHeight)
            this.__onSizeChange(newWidth, newHeight, this.oldWidth, this.oldHeight);
        this.oldWidth = newWidth;
        this.oldHeight = newHeight
        this.__setSettingsToTrueWidth(false);
    }
    __setSettingsToTrueWidth(val){
         this.scrollContainer.$(".content").children().each(function(){
            if(this.__setToTrueWidth)
                this.__setToTrueWidth(val);
        });
        if(val)    $(this).css("min-width", "auto");
        else    $(this).css("min-width", "");
        this.scrollContainer.updateSize(true);
    }
    
    //category listener methods
    openCategory(category){
        this.selectedCategory = category;
        this.openedCategories = [];
        this.openedCategoryElements = [];
        var container = this.scrollContainer.$(".content");
        
        //stop adding settings of previous category
        for(var stopFunc of this.stopOpeningCategoryFunctions){
            stopFunc();
        }
        this.stopOpeningCategoryFunctions = [];
        
        //remove old settings
        container.children().not(".resize-sensor").remove();

        //reset error message
        this.invalidValueFunc(false);
        
        //reset listeners
        for(var i=0; i<this.categoryChildrenListener.length; i++){
            var listener = this.categoryChildrenListener[i];
            listener.category.removeChildrenListener(listener.listener);
        }
        this.categoryChildrenListener = [];
        
        //add settings (separate method because a category can also add itself, see 'categoryPushSettings')
        this.addCategory(category);

        //notify about the size change, as the resize listener doesn't seem to catch it
        this.__sendSizeChangeUpdate();
    }
    addCategory(category){
        var t = this;
        this.openedCategories.push(category);
        var container = this.scrollContainer.$(".scrollContent");
        
        var path = category.getPath();
        this.openedCategoryElements[path] = [];
        //add all settings
        this.stopOpeningCategoryFunctions.push($Utils.iterate(category.getChildrenList(), function(){ //sorting will be done by the created element itself
//            this == setting
//            if(!this._hasChildren || this._defaultValue!=undefined){     //check if it is a setting, and not just a category, (could also be a GUIelement)        
//            }
            var elementClass = $SettingElementTypesHandler.getElementClass(this);
            var element = new elementClass(this, t.invalidValueFunc, t.helpMessageFunc, t);
            t.openedCategoryElements[path].push(element);
            container.append(element);
//            if(this._hasChildren && this._categoryPushSettings){
//                t.addCategory(this);
//            }
        }, null, function(){
            //fires every time a batch of settings is added
            //notify about the size change, as the resize listener doesn't seem to catch it
            t.scrollContainer.updateSize(true, true);
            t.__sendSizeChangeUpdate();
        }));
        
        //listen for category children changes, in order to update the settings
        var func = function(action, setting, name){
            setTimeout(function(){                
                if(action=="create"){
                    var elementClass = $SettingElementTypesHandler.getElementClass(setting);
                    container.append(new elementClass(setting, t.invalidValueFunc, t.helpMessageFunc, t));
                }else if(action=="delete"){
                    container.children().each(function(){
                        if(this.setting==setting)
                            $(this).remove();
                    });
                }
            })
        };
        this.categoryChildrenListener.push({category:category, listener:func});
        category.addChildrenListener(func);
    }
    removeCategory(category){
        var t = this;
        var container = this.scrollContainer.$(".content");
        
        //remove setting from list
        var categoryIndex = this.openedCategories.indexOf(category);
        this.openedCategories.splice(categoryIndex, 1);

        var path = category.getPath();
        //remove all settings
        for(var settingElement of this.openedCategoryElements[path]){
            settingElement.destroy();
            $(settingElement).remove();
        }
        this.__sendSizeChangeUpdate();
        
        //remove listener for category children changes
        var listenerIndex = this.categoryChildrenListener.findIndex(function(o){ return o.category==category});
        if(listenerIndex){
            category.removeChildrenListener(this.categoryChildrenListener[listenerIndex]);
            this.categoryChildrenListener.splice(listenerIndex, 1);
        }
    }
}
window.SettingsContainerElementClass.registerElement();