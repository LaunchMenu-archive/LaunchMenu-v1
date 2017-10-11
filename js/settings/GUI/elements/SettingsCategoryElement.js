loadOnce("/GUIelements/TreeBranchElement");
(function(){
    const nameKey = Setting.getSymbol("name");
    const hasChildrenKey = Setting.getSymbol("hasChildren");
    
    window.SettingsCategoryElementClass = class SettingsCategoryElementClass extends TreeBranchElementClass{
        constructor(category, parent, selectCallback){
            if(!category) throw Error("This item can't be created from HTML, it requires a $Settings category");
            super(category._categoryDisplayName || category[nameKey]);
            
            this.category = category;
            this.parent = parent;
            this.selectCallback = selectCallback;
            
            //adds all children to its content and creates a listener that will add any newly created children, and remove deleted children
            SettingsCategoryElement.createCategoryContainer(this.$(".contentInner"), category, selectCallback, this);
            
            //sync all data to the setting data
            this.updateExpandability();
            this.updateVisibility();
            
            this.__createPropertyListener();
        }
        __initHtml(){
            var t = this;
            this.$(".header").click(function(){
                t.select();
            });
        }
        
        //triggers when the element gets added to its parent element
        connectedCallback(){ //moves itself to the correct index when being placed in an element
            this.updateIndex();        
        }
        //update element when any important properties change
        __createPropertyListener(){
            var t = this;
            //listen to attribute changes, to see if the element order or visibility changes
            this.propertyListener = function(type, variable, value, directProperty){
                if(variable=="_categoryIndex" || variable=="_categoryAbove"){
                    t.updateIndex();
                }else if(variable=="_categoryInvisible"){
                    t.updateVisibility();
                }else if((variable=="_defaultValue" || variable=="_settingInvisible") && t.parent){
                    t.parent.updateVisibility();
                }else if(variable=="_categoryDisplayName"){
                    t.updateName();
                }
            };
            this.category.addPropertyListener(this.propertyListener);
        }
        
        //methods to sync properties with the settings data
        updateIndex(){
            if(!this.movingItself){ //the connectedCallback will trigger this function when it moves itself, so the movingItself property will stop recursion
                this.movingItself = true;
                var children = $(this).parent().children(); //get a list of siblings
                
                //find the child to move the element in front of
                var childAfter = null;
                for(var i=0; i<children.length; i++){
                    var child = children[i];
                    if(child.category && (!child.category._categoryIndex || child.category._categoryIndex>this.category._categoryIndex)){
                        childAfter = child;
                        break;
                    }
                }
                
                //move element
                if(childAfter)
                    $(this).insertBefore(childAfter);
                delete this.movingItself;
            }
        }
        updateIndex(){
            if(!this.movingItself){ //the connectedCallback will trigger this function when it moves itself, so the movingItself property will stop recursion
                this.movingItself = true;
                var children = $(this).parent().children(); //get a list of siblings
                
                //category above
                if(this.category._categoryAbove)
                    var categoryAbove = this.category.getParent().getSettingFromPath(this.category._categoryAbove);
                var updateCategories = []; //categories that should be updated because they should be placed after this category
                
                //find the child to move the element in front of
                var childAfter = null;
                var childBefore = null;
                for(var i=0; i<children.length; i++){
                    var child = children[i];
                    if(child.category && child!=this){           
                        if(child.category._categoryAbove==this.category[nameKey]){                                   //update elements affected by this element
                            updateCategories.push(child);
                        }else if(categoryAbove && categoryAbove==child.category){                                    //sort by category above
                            childBefore = child;
                        }else if(child.category._categoryAbove==undefined){
                            if(!childAfter && typeof child.category._categoryIndex!="number"                         //sort alphabetically
                                           && typeof this.category._categoryIndex!="number"){
                                if(child.$(".title").text()>this.$(".title").text()){
                                    childAfter = child;
                                }
                            }else if(!childAfter && (child.category._categoryIndex==undefined                        //sort by index 
                                                  || child.category._categoryIndex>this.category._categoryIndex)){
                                childAfter = child;
                            }
                        }
                    }
                }
                
                //move element
                if(childBefore)
                    $(this).insertAfter(childBefore); //add after a setting that is assigned to be above
                else if(childAfter)
                    $(this).insertBefore(childAfter); //add before a setting with a higher index
                else
                    $(this).parent().append($(this)); //add to end of container

                //update settings that are affected by the insertion of this element
                for(var categoryEl of updateCategories)
                    categoryEl.updateIndex();
                
                delete this.movingItself;
            }
        }
        
        __containsVisibleSettings(){
            var hasVisibleSettings = false;
            this.$(".contentInner").children().each(function(){
                if(this.category._defaultValue!==undefined && !this.category._settingInvisible)
                    hasVisibleSettings = true;
                else if(this.__containsVisibleSettings())
                    hasVisibleSettings = true;
            });
            return hasVisibleSettings;
        }
        updateVisibility(){
            var wasInvisible = this.invisible;
            if(this.category._categoryInvisible) //if the category is invisible, the element should be as well
                this.setInvisible(true);
            else if(!this.category[hasChildrenKey]) //if the category doesn't have any children, it is not a category but a setting
                this.setInvisible(true);
            else                                 //if it has children, make sure there is a visible setting in one of them
                this.setInvisible(!this.__containsVisibleSettings());
            if((wasInvisible!=this.invisible || this.category._categoryPushSettings) && this.parent){
                this.parent.updateVisibility();
            }
            
            //also update its expandability;
            this.updateExpandability();
        }
        updateExpandability(){
            this.setExpandable(this.$(".contentInner").children().filter(function(){
                return !this.invisible;
            }).length>0);
        }
        updateName(){
            this.setName(this.category._categoryDisplayName || this.category[nameKey]);
        }
        
        //methods to update appearance
        setInvisible(invisible){
            this.invisible = invisible;
            if(invisible){
                $(this).hide();
                //select a different element if this element was selected or contained a selected category
                if($(this).find(".selected").length>0 || this.selected){
                    //select a sibling if possible
                    var children = $(this).parent().children();
                    outer:{
                        for(var i=0; i<children.length; i++){
                            var child = children[i];
                            if(child.select && !child.invisible){
                                child.select();
                                break outer;
                            }
                        }
                        
                        //select parent if there are no available siblings
                        if(this.parent)
                            this.parent.select();
                    }
                }
            }else{
                $(this).show();
            }
        }
        setExpandable(expandable){
            this.expandable = expandable;
            if(expandable){
                this.$(".arrow").css("opacity", 1);
                if(this.selected && !this.isOpen())
                    this.open();
            }else{
                this.$(".arrow").css("opacity", 0);
                if(this.isOpen())
                    this.close();
            }
        }
        setName(name){
            this.$(".title").text(name);
        }
        
        //methods for the select/deselect system that automatically opens children of a selected element, and triggers the select callback 
        select(){
            super.select();
            
            if(this.selectCallback)
                this.selectCallback(this);
            
            //open children and parents
            var p = this;
            
            if(!this.isOpen())
                this.open();
        }
        deselect(){
            //if this element was, or contained, the selected element 
            //and isn't and doesn't contain the newly selected element
            //close the element
            if(($(this).find(".selected").length>0 || $(this).is(".selected")) && 
                    ($(this).find(".newSelected").length==0 && !$(this).is(".newSelected")) &&
                    this.isOpen()) 
                this.close();
            
            super.deselect();
        }
        
        //check if the element can even be opened, before opening it
        open(){
            if(this.expandable){
                super.open();
            }
        }
        
        //clean up this function by making the parameters a bit more descriptive
        static createCategoryContainer(element, category, selectCallback, parent){
            
            //add all setting categories (this process is recursive as it also happens in SettingsCategoryElement initialisation)
            var keys = Object.keys(category);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = category[key];
                if(key[0]!="_" && key!="value")
                    element.append(new SettingsCategoryElement(val, parent, selectCallback));
            }
            
            //listen to category children changes and update the element
            category.addChildrenListener(function(action, childCategory, name){
                if(action=="create"){
                    element.append(new SettingsCategoryElement(childCategory, parent, selectCallback));
                }else if(action=="delete"){
                    //find the element that is connected with the setting
                    element.children().each(function(){
                        if(this.category == childCategory)
                            $(this).remove();
                    });
                }
                
                //update parent's visibility, as the addition/removal of elements can alter that
                if(parent)
                    parent.updateVisibility();
            });
        }
    }
    window.SettingsCategoryElementClass.registerElement();
})();