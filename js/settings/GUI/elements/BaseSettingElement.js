loadOnce("$SettingElementTypesHandler");
loadOnce("/GUIelements/BaseElement");
loadOnce("/contextMenu/ContextMenu");
(function(){
    const nameKey = Setting.getSymbol("name");
    
    window.BaseSettingElementClass = class BaseSettingElementClass extends BaseElementClass{
        constructor(setting, invalidValueFunc, helpMessageFunc, container, preInitFunc){ //preInitFunc is intended to be used when extending this class, not as an external argument
            super(function(){ //postInit function, combine templates before using the template
                this.setting = setting; //add the setting as soon as possible;
                
                this.template.html = this.template.html.replace("_VALUE_",   this.valueTemplate.html);
                this.template.style += this.valueTemplate.style;
                
                if(preInitFunc)
                    preInitFunc.call(this);
            });
            
            this.invalidValueFunc = invalidValueFunc;
            this.helpMessageFunc = helpMessageFunc;
            
            this.container = container;
            
            this.visibilityCheckVisible = true;
            this.updateVisibility();
            this.updateShowChildSettings();
            this.updateDisabled();
            this.updateSpacing();
            this.updateName();
            this.__createListeners();
            
            this.contextMenu = new ContextMenu([
                {
                    icon: "",
                    text: "Open Help Menu",
                    func: function(){
                        if(this.helpMessageFunc){
                            var m = this.setting._settingHelpMessage;
                            this.helpMessageFunc(m, [this.setting, this]); //array of arguments for if it is an class
                        }
                    }
                },
                {
                    icon: "",
                    text: "Reset To Default",
                    func: function(){
                        this.setValue(this.setting._defaultValue);
                    }
                },
                null, //divider
                {
                    icon: "",
                    text: "Show Valid Value",
                    func: function(){
                        this.setValue(this.setting.value);
                    }
                }
            ]);
            this.contextMenu.bindToElement($(this), this);
    
            this.settingUpdatingValue = true; //make sure the value changes are not forwarded by indicating the value was changed by the setting
            this.setValue(setting.value);
            delete this.settingUpdatingValue;
        }
        __initVars(){
            super.__initVars();
            this.template = {
                html: `<div class='container f0 bg0 bd0'>
                            <div class='disabledOverlay bg4'></div>
                            <div class=title></div>
                            <div class=value>
                                _VALUE_
                            </div>
                       </div>`,
                style: `.root{
                            margin-top: -1px; /*make bottom and top borders of settings overlap*/
                            width: fit-content;
                            min-width: 100%;
                        }
                        .container{
                            border-width: 1px;
                            min-height: 17px;
                            padding: 5px;
                            box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
                            
                            display: flex;
                            width: fit-content;
                            min-width: calc(100% - 12px); /*subtract padding and border*/
                        }
                        .title{
                            margin-right: 5px;
                            flex: 1; //take up all available space, so the value appears on the right
                        }
                        .disabled .disabledOverlay{
                            display: block;
                        }
                        .disabledOverlay{
                            display: none;
                            
                            cursor: not-allowed;
                            opacity: 0.5;
                            
                            position: absolute;
                            left: 0;
                            right: 0;
                            top: 0;
                            bottom: 0;
                        }`
            };
            this.valueTemplate = {
                html: ``,
                style:``
            };
        }
        __initHtml(){
            super.__initHtml();
            $(this).focusin(function(){
                this.isValueValid(this.value); //update error message
            });
        }
        
        //events that can easily be tapped into and altered
        __valueChange(value, oldValue){}                 //fires to change the value
    
        
    
        //methods to be used for proper container resizing:
        __setToTrueWidth(val){
            if(val){
                this.$(".title").css("flex", "0");
                this.$(".container").css("min-width", "auto");
            }else{
                this.$(".title").css("flex", "");
                this.$(".container").css("min-width", "");
            }
        }
        __getTrueWidth(outerWidth){
            this.__setToTrueWidth(true);
            var val;
            if(outerWidth)  val = $(this).outerWidth();
            else            val = $(this).width();
            this.__setToTrueWidth(false);
            return val;
        }
        updateSize(){
            var container = $(this).closest("c-settings-container")[0];
            if(container && container.__sendSizeChangeUpdate)
                container.__sendSizeChangeUpdate();
        }
        
        //triggers when the element gets added to, or removed from, its parent element
        connectedCallback(){ //moves itself to the correct index when being placed in an element
            this.updateIndex();  
            this.__connectListeners();     
        }
        disconnectedCallback(){ //remove listeners when element is removed
            this.__disconnectListeners();
        }
        
        //update element when any important properties change
        __createListeners(){
            var t = this;
            //listen to attribute changes, to see if the element order or visibility changes
            this.propertyListener = function(type, variable, value, directProperty){
                if(variable=="_settingIndex" || variable=="_settingAbove"){
                    t.updateIndex();
                }else if(variable=="_settingInvisible" || variable=="_defaultValue"){
                    t.updateVisibility();
                }else if(variable=="_settingDisabled"){
                    t.updateDisabled();
                }else if(variable=="_settingSpacing"){
                    t.updateSpacing();
                }else if(variable=="_settingDisplayName"){
                    t.updateName();
                }else if(variable=="_categoryPushSettings"){
                    t.updateShowChildSettings();
                }else if(variable.split(".")[0]=="_settingVisibilityCheck"){
                    t.__disconnectVisibilityListeners();
                    t.__connectVisibilityListeners();
                }
                if(variable=="_defaultValue" || variable=="_GUIclass")
                    t.updateElementType();
            };
            this.valueChangeListener = function(newValue, oldValue){
                t.settingUpdatingValue = true; //make sure the value changes are not forwarded by indicating the value was changed by the setting
                t.setValue(newValue);
                delete t.settingUpdatingValue;
            }
            this.__connectListeners();
        }
        __connectVisibilityListeners(){
            var t = this;
            if(this.setting._settingVisibilityCheck && 
                    this.setting._settingVisibilityCheck.settings instanceof Array &&
                    this.setting._settingVisibilityCheck.func instanceof Function){
                
                //the function to update the visibility
                const f = this.setting._settingVisibilityCheck[Setting.getSymbol("target")].func;
                const  func = function(){
                    var values = [];
                    for(var setting of t.settingsListeners)
                        values.push(setting[0].value);
                    t.visibilityCheckVisible = f.apply(t.setting, values);
                    t.updateVisibility();
                }
                
                //add listeners to all settings
                var settings = this.setting._settingVisibilityCheck.settings;
                this.settingsListeners = [];
                
                for(var i=0; i<settings.length; i++){
                    var setting = $Settings.getSettingFromPath(settings[i]);
                    this.settingsListeners.push([setting,func]);
                    setting.addListener(func);
                }
                
                //update visibility
                func();
            }
        }
        __disconnectVisibilityListeners(){
            if(this.settingsListeners){
                for(var setting of this.settingsListeners){
                    setting[0].removeListener(setting[1]);
                }
            }
        }
        __disconnectListeners(){
            if(this.listenersConnected){                
                this.listenersConnected = false;
                
                this.setting.removePropertyListener(this.propertyListener);
                this.setting.removeListener(this.valueChangeListener);
                this.__disconnectVisibilityListeners();
            }
        }
        __connectListeners(){
            if(!this.listenersConnected){                
                this.listenersConnected = true;
                
                this.setting.addPropertyListener(this.propertyListener);
                this.setting.addListener(this.valueChangeListener);
                this.__connectVisibilityListeners();
            }
        }
        
        //value change methods
        setValue(newValue){ //set value method, gets fired automatically when a settings value is changed
            if(!this.updatingValue){            
                this.updatingValue = true;
                
                var oldValue = this.value;
                this.__updateSettingValue(newValue); //changes the setting, and forwards it if necessary 
//                if(this.value!==oldValue)
                this.__valueChange(newValue, oldValue);
                
                delete this.updatingValue;
            }
        }
        __updateSettingValue(value, args){ //attempt to change setting value, parameter is optional
            var oldValue = this.value;
            if(value!==undefined) this.value = value;
            
            //prevent recursion, and make sure __valueChange doesn't trigger from the event listener
            var wasUpdating = this.updatingValue;
            this.updatingValue = true;
            
            if(!this.settingUpdatingValue){ //check if the value change wasn't triggered by the setting
                //attempt to change the value
                var ret = this.setting.setValue(this.value, args);
                this.valueInvalid = ret && !ret.success?ret.message:false; //store data of the value validity for random usage
                if(ret && !ret.success){
                    this.__sendInvalidValueCallback(ret);
                    if(!this.invalidValueFunc)
                        console.error(ret.message);
                }else{
                    this.__sendInvalidValueCallback(false); //say that the value is valid
                }        
            }else{
                this.__sendInvalidValueCallback(false); //say that the value is valid
            }
            
            if(!wasUpdating)
                delete this.updatingValue;
        }
        isValueValid(value, dontSendCallback){
            var ret = this.setting.isValueValid(value)
            if(!dontSendCallback){
                if(!ret.success)
                    this.__sendInvalidValueCallback(ret, true);
                else
                    this.__sendInvalidValueCallback(false);
            }
            return ret;
        }
        __sendInvalidValueCallback(invalidMessageObject, valueCheckOnly){ //invalidMessageObject will be the value returned by a setting's isValueValid method
            if(invalidMessageObject && invalidMessageObject.success)
                invalidMessageObject = false;
            if(this.invalidValueFunc)
                this.invalidValueFunc(invalidMessageObject, this.value, valueCheckOnly); //valueCheckOnly will be true when the setting hasn't been update with the value yet
    
            //update contextmenu button
            if(invalidMessageObject){
                this.contextMenu.buttons[2].show();
            }else{
                this.contextMenu.buttons[2].hide();
            }
        }
        
        //methods to sync properties with the settings data
        updateIndex(){
            if(!this.movingItself){ //the connectedCallback will trigger this function when it moves itself, so the movingItself property will stop recursion
                this.movingItself = true;
                var children = $(this).parent().children(); //get a list of siblings
                
                //setting above
                if(this.setting._settingAbove)
                    var settingAbove = this.setting.getParent().getSettingFromPath(this.setting._settingAbove);
                var updateSettings = []; //settings that should be updated because they should be placed after this setting
                
                //find the child to move the element in front of
                var childAfter = null;
                var childBefore = null;
                for(var i=0; i<children.length; i++){
                    var child = children[i];
                    if(child.setting && child!=this){           
                        if(child.setting._settingAbove==this.setting[nameKey]){                                      //update elements affected by this element
                            updateSettings.push(child);
                        }else if(settingAbove && settingAbove==child.setting){                                       //sort by setting above
                            childBefore = child;
                        }else if(child.setting._settingAbove==undefined){
                            if(!childAfter && typeof child.setting._settingIndex!="number"                           //sort alphabetically
                                           && typeof this.setting._settingIndex!="number"){
                                if(child.$(".title").text()>this.$(".title").text()){
                                    childAfter = child;
                                }
                            }else if(!childAfter && (child.setting._settingIndex==undefined                          //sort by index 
                                                  || child.setting._settingIndex>this.setting._settingIndex)){
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
                for(var settingEl of updateSettings)
                    settingEl.updateIndex();
                
                delete this.movingItself;
            }
        }
        updateShowChildSettings(){
            this.setShowChildSettings(this.setting._categoryPushSettings);
        }
        updateVisibility(){
            this.setInvisibility(!this.visibilityCheckVisible || this.setting._settingInvisible || this.setting._defaultValue===undefined);
        }
        updateElementType(){
            var c = $SettingElementTypesHandler.getElementClass(this.setting);
            if(this.constructor != c){
                var element = new c(this.setting);
                $(this).replaceWith(element);
            }
        }
        updateDisabled(){
            this.setDisabled(this.setting._settingDisabled);
        }
        updateSpacing(){
            var val = this.setting._settingSpacing;
            this.setSpacing(typeof val == "boolean"?(val?10:0):val)
        }
        updateName(){
            this.setName(this.setting._settingDisplayName || this.setting[nameKey]);
        }
    
        //methods to update appearance
        setInvisibility(invisible){
            if(invisible){
                $(this).hide();
            }else{
                $(this).show();
            }
            this.invisible = invisible;
        }
        setDisabled(disabled){
            if(disabled){
                $(this).addClass("disabled");
            }else{
                $(this).removeClass("disabled");
            }
            this.disabled = disabled;
        }
        setSpacing(spacing){
            $(this).css("margin-top", spacing);
        }
        setName(name){
            this.$(".title").text(name.replace(/([A-Z][^A-Z]*)/g, function(match){
                return " "+match.toLowerCase();
            }));
            this.updateSize();
        }
        setShowChildSettings(show){
            if(this.container)
                if(show){
                    if(!this.childrenVisible){                    
                        this.container.addCategory(this.setting);
                        this.childrenVisible = true;
                    }
                }else{
                    if(this.childrenVisible){
                        this.container.removeCategory(this.setting);
                        this.childrenVisible = true;
                    }
                }
        }
        
        //destroy method to clean up after the element (this is partially done by disconnectedCallback)
        destroy(){
            this.setShowChildSettings(false);
        }
        
        static matchesSetting(setting){ //code to determine if the setting element matches the setting
            return false;
        }
    }
})();