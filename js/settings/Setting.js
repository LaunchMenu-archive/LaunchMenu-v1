loadOnce("$Settings");
loadOnce("$SettingValidator");
//load $CommuncationUtils, SettingCopy, SyncedObject and SyncedArray at end of file, as the intilisation of those requires Setting to be defined
(function(){    
    //done  TODO make system to make the setting itself hook into property changes (EG, call __validateCurrentValue, when validations change)
    //done  TODO make a way of preventing changes to be forwarded to a window that contains the same group
    //done  TODO make a system to indicate property definition order
    //done  TODO make a system to indicate what properties might be external files (EG, when defining a helpMenuClass)
    //done  TODO make a property change only send one update, even if it is a object
    //done  TODO make communcationUtils encode/decode data work with recursive structures
	//done  TODO make communicationUtils escape strings, so you can't inject function/class data through strings
	//done  TODO make syncedObjects work with recursive structures
    //done  TODO make a SyncedArray class
    //      TODO make an option to make the entire value synchronized
    //done  TODO make a method for opening and close settings gui from within $Settings
    //done  TODO make a loadScripts method that returns a syntax that the $CummunicationUtils will catch and load too
    //      TODO make a way of copying settings to other categories in the GUI
    
    //done  TODO make styling transition stop properly if switching too soon
	
    
    const propertyIndicator = "_";
    const defaultValueName = "_defaultValue";
    const validationsName = "_validations";
    
    const externalChangeIndicator = Symbol("externalChange");   //indicator of settings changes coming from the settings host, and shouldn't be forwarded
    const parentKey = Symbol("parent");                         //the parent setting of a setting or SyncedObject/Array, used to retrieve the path
    const nameKey = Symbol("name");                             //the name of the setting or SyncedObject/Array, used to retrieve the path
    const listenersKey = Symbol("listeners");                   //the array to store the listeners of a setting
    const proxyKey = Symbol("proxy");                           //a reference to the proxy of the setting or SyncedObject/Array
    const targetKey = Symbol("target");                         //a reference to the base object of the setting or SyncedObject/Array
    const hasChildrenKey = Symbol("hasChildren");               //an indicator if the setting has any child settings
    const classPropertiesKey = Symbol("classProperties");       //a list of properties that might be classes, and will be parsed when set to a file path
    const convertingKey = Symbol("converting");                 //an indicator if the setting or SyncedObject/Array is being converted(by getObject for instance), prevents infinite recursion
    
    const updateSettingKey = Symbol("updateSetting");           //a symbol that can be used as a function name on objects, to allow them to retrieve an update function,
                                                                //  which will re-set the value or property, so its changes will be forwarded
                                                                //  only works in combination with $CommunicationUtils.encodeSymbol  
    const constantsKey = Symbol("constants");                   //a symbol that can be used as a function name on objects, to allow them to keep constants when the value is overwritten
                                                                //  the function will both be the getter and setter
    
    var copyingSettingsKey;  //will be set at bottom of file    //an array of SettingCopys, if any setting copies this setting, used for transferring data on deletion
    var settingCopyTargetKey;//will be set at bottom of file    //a reference to the base settingCopy object
    
    const propertyOrder = [
        ["_defaultValue", -10]
    ];
    const classProperties = [ //properties that could potentially be a class
        "_GUIclass",
        "_settingHelpMessage"
    ];
    
    //synchronisation functions
    const sendSetValue = function(setting, args){
        if(!setting[externalChangeIndicator])
            $Settings.__sendUpdate({type:"changeValue", data:{path: setting.getPath(true), 
                                                              args: args,
                                                              value: $CommunicationUtils.encodeClassData(setting.value)}});
    };
    const sendSetProperty = function(setting, property, value){
        if(!setting[externalChangeIndicator])
            $Settings.__sendUpdate({type:"changeProperty", data:{path: setting.getPath(true), 
                                                                 property: property, 
                                                                 value: $CommunicationUtils.encodeClassData(value)}});
    };
    const sendDeleteProperty = function(setting, property){
        if(!setting[externalChangeIndicator])
            $Settings.__sendUpdate({type:"deleteProperty", data:{path: setting.getPath(true), 
                                                                 property: property}});
    };
    const sendCreateSetting = function(setting, parent, copiedSetting){
        if(!parent[externalChangeIndicator])
            $Settings.__sendUpdate({type:"createSetting", data:{path: setting.getPath(true), copiedSetting: copiedSetting}});
    };
    const sendDeleteSetting = function(setting){
        if(!setting[externalChangeIndicator])
            $Settings.__sendUpdate({type:"deleteSetting", data:{path: setting.getPath(true)}});
    };
    
    //setting's object
    window.Setting = class Setting{
        constructor(name, parent){
            this[listenersKey] = [[], [], []];
            this[nameKey] = name;
            this[parentKey] = parent;
            this[targetKey] = this;
            this[hasChildrenKey] = false;
            
            //setup potential class properties
            this[classPropertiesKey] = [[],[]];
            if(parent){
                var l = parent[classPropertiesKey][0].concat(parent[classPropertiesKey][1]);
                this.__addToClassPropertyList(l);
            }else       this.__addToClassPropertyList(classProperties);
            if(classProperties.length==0) delete this[classPropertiesKey];
        }
        
        //value functions
        [Symbol.toPrimitive](){
            if(this.value!==undefined)
                return this.value;
            return this.getString();
        }
        setValue(value, overwrite){
            var oldValue = this.value;
            
            //get extra arguments
            var args = $.extend([], arguments);
            args.shift();
            
            var isExternal = this[externalChangeIndicator];
            var eventData = { //create a collection of relevant data to send with the event
                setting: this[proxyKey], 
                newValue: value,
                currentValue: oldValue,
                args: args,
                externalChangeIndicator: isExternal
            };
            if(isExternal || $EventHandler.trigger("setValue:pre", $Settings, eventData)){
                if(value!=oldValue || overwrite){
                    //check if the value meets all conditions
                    if(this._validations){
                        var resp = this.isValueValid(value, true);
                        if(!resp.success)
                            return resp;                    
                    }
                    
                    //set value
                    this.value = value;
                    
                    //set update function of object (which will re-sent the object when it is called), if the object allows this
                    if(value && value[updateSettingKey]){
                        var t = this;
                        value[updateSettingKey](function(){
                            t.setValue(this, true);
                        });
                    }
                    //transfer constants, if the object allows this
                    if(value && oldValue && value[constantsKey] && oldValue[constantsKey]){
                        if(value.__proto__.constructor[constantsKey] ||
                           value.__proto__ == oldValue.__proto__){
                            var constants = oldValue[constantsKey]();
                            value[constantsKey].apply(value, constants);
                        }
                    }
                    
                    //sync with other windows settings
                    sendSetValue(this, args);
                    
                    //send new value to all listeners
                    this.__invokeListeners(0, [value, oldValue].concat(args));
                    
                    //send general event
                    var eventData =    { //create a collection of relevant data to send with the event
                        setting: this[proxyKey], 
                        value: value, 
                        oldValue: oldValue,
                        args: args
                    };
                    $EventHandler.trigger("setValue:post", s, eventData);
                }
                return null;
            }
            return {success: false};
        }
        isValueValid(value, isNotPreSetCheck){
            if(this[validationsName])
                return $SettingValidator.validate(value, this[proxyKey], this[validationsName], !isNotPreSetCheck);
            return {success: true};
        }
        getValue(){
            return this.value;
        }
        
        //proxied methods
        createChildSetting(name){
            var isExternal = this[externalChangeIndicator];
            if(isExternal || $EventHandler.trigger("createSetting:pre", $Settings, {parent:this[proxyKey], name:name})){
                //dispose the old setting or settingCopy
                var oldChild = this[name];
                if(oldChild instanceof Setting || oldChild instanceof SettingCopy)
                    oldChild.delete();
                
                //create setting
                var setting = Setting.createSettingProxy(new Setting(name, this[proxyKey]));
                this[name] = setting;
//                console.log(this, name, setting, this[name]);
                this[hasChildrenKey] = true;
                
                //sync with other windows settings
                sendCreateSetting(setting, this[proxyKey]);
                
                //send new setting to all listeners
                this.__invokeListeners(1, ["create", this[name], name]);

                //send general createSetting event
                $EventHandler.trigger("createSetting:post", $Settings, {setting: this[name]});
                return this[name];
            }
        }
        createChildSettingCopy(name, copiedSetting){
            var isExternal = this[externalChangeIndicator];
            if(isExternal || $EventHandler.trigger("createSetting:pre", $Settings, {parent:this[proxyKey], name:name, copiedSetting:copiedSetting})){
                //dispose the old setting or settingCopy
                var oldChild = this[name];
                if(oldChild instanceof Setting || oldChild instanceof SettingCopy)
                    oldChild.delete();
                
                //create setting
                var setting = SettingCopy.createSettingCopyProxy(new SettingCopy(name, this[proxyKey], copiedSetting));
                this[name] = setting;
                this[hasChildrenKey] = true;
                
                //sync with other windows settings
                sendCreateSetting(setting, this[proxyKey], copiedSetting.getPath(true));
                
                //send new setting to all listeners
                this.__invokeListeners(1, ["create", this[name], name, copiedSetting]);

                //send general createSetting event
                $EventHandler.trigger("createSetting:post", $Settings, {setting: this[name], copiedSetting:copiedSetting});
                return this[name];
            }
        }
        setDefinition(obj){
            //add properties in defined order
            for(var prop in propertyOrder){
                prop = prop[0];
                if(obj[prop]){
                    this.setProperty(prop, obj[prop]);
                    delete obj[prop]
                }
            }
            
            //add properties in random order
            for(var key in obj)
                this.setProperty(key, obj[key]);
        }
        setProperty(property, value){
            property = (property[0]==propertyIndicator?"":propertyIndicator)+property;
            var oldValue = this[property];
            var isExternal = this[externalChangeIndicator];
            var eventData = {
                setting: this[proxyKey],
                property: property,
                newValue: value,
                currentValue: oldValue
            }
            if(isExternal || $EventHandler.trigger("setProperty:pre", $Settings, eventData)){                
                //change property
                if(value==null || property==defaultValueName){      //set default or empty value 
                    this[property] = value;
                }else if(value[$CommunicationUtils.encodeSymbol]){  //set any transferable object
                    this[property] = value;
                }else if(SyncedArray.isValidArray(value)){          //set proxyable array
                    this[property] = SyncedArray.createProxiedSyncedArray(property, this[proxyKey], value);
                }else if(SyncedObject.isValidObject(value)){        //set proxyable object
                    this[property] = SyncedObject.createProxiedSyncedObject(property, this[proxyKey], value);
                }else{                                              //set any primitive value
                    this[property] = value;
                }
                
                //revalidate current value, if the devault value or the validations changed
                if(property==defaultValueName || property==validationsName)
                    this.__validateCurrentValue();
                
                //set update function of object (which will re-sent the object when it is called), if the object allows this
                if(value && value[updateSettingKey]){
                    var t = this;
                    value[updateSettingKey](function(){
                        t.setProperty(property, this);
                    });
                }
                //transfer constants, if the object allows this
                if(value && oldValue && value[constantsKey] && oldValue[constantsKey]){
                    if(value.__proto__.constructor[constantsKey] ||
                       value.__proto__ == oldValue.__proto__){
                        var constants = oldValue[constantsKey]();
                        value[constantsKey].apply(value, constants);
                    }
                }
                
                //sync with other windows settings
                sendSetProperty(this, property, this[property]);
                
                //change class path to class if applicable
                var isClassProperty = this.__isClassProperty(property, value);
                if(typeof isClassProperty == "boolean"){        //is class property
                    if(isClassProperty){
                        var scriptReturn = $ScriptLoader.loadOnce(this[property]);
                        if(scriptReturn) this[property] = scriptReturn;
                    }
                }else if(this[property].__setClassPropertyList){//child object/array might contain an classPath, and isClassProperty is actually an array of possible child classes
                    this[property].__setClassPropertyList(isClassProperty);
                }
                
                //send new value to all listeners
                this.__invokeListeners(2, ["set", property, this[property], oldValue, true]);

                //send general setProperty event
                var eventData = {
                    setting: this[proxyKey],
                    property: property,
                    value: this[property],
                    oldValue: oldValue
                }
                $EventHandler.trigger("setProperty:post", $Settings, eventData);
            }
        }
        deleteProperty(property){
            property = (property[0]==propertyIndicator?"":propertyIndicator)+property;
            var oldValue = this[property];
            var isExternal = this[externalChangeIndicator];
            var eventData = {
                setting: this[proxyKey],
                property: property,
                currentValue: oldValue
            }
            if(isExternal || $EventHandler.trigger("deleteProperty:pre", $Settings, eventData)){
                //delete property
                delete this[property];
                if(property==defaultValueName){             //delete default value
                    this.__validateCurrentValue();
                }else if(property==validationsName){        //delete validations
                    this.__validateCurrentValue();
                }
                
                //sync with other windows settings
                sendDeleteProperty(this, property);
                
                //send delete value to all listeners
                this.__invokeListeners(2, ["delete", property, undefined, oldValue, true]);

                //send general deleteProperty event
                var eventData = {
                    setting: this[proxyKey],
                    property: property,
                    oldValue: oldValue
                }
                $EventHandler.trigger("deleteProperty:post", $Settings, eventData);
            }
        }
        getProperty(property){
            //append propertyIndicator if not present
            property = (property[0]==propertyIndicator?"":propertyIndicator)+property;
            
            //go through all parts of the property string and get the final property
            var parts = property.split(".");
            var out = this[proxyKey];
            for(var part of parts){
                out = out[part];
            }
            
            return out;
        }
        delete(){
            var isExternal = this[externalChangeIndicator];
            if(isExternal || $EventHandler.trigger("deleteSetting:pre", $Settings, {setting: this[proxyKey]})){
                var parent = this[parentKey][targetKey];
                delete parent[this[nameKey]];
                
                //transfer data to copying settings, if available
                if(!isExternal && this[copyingSettingsKey] && this[copyingSettingsKey].length>0){
                    //replace settingCopy with a real setting
                    var settingCopies = this[copyingSettingsKey];
                    var settingCopy = settingCopies[0];
                    var parent = settingCopy[parentKey]; 
                    var setting = parent.createChildSetting(settingCopy[nameKey]);
                    
                    //copy this data to new setting
                    setting.setData(this);
                    
                    //update settingCopies
                    for(var i=settingCopies.length-1; i>=0; i--){
                        var settingCopy = settingCopies[i];
                        var parent = settingCopy[parentKey];
                        parent.createChildSettingCopy(settingCopy[nameKey], setting);
                    }
                }
                
                //update parent
                if(parent.getChildrenList().length==0)
                    parent[hasChildrenKey] = false;
                
                //sync with other windows settings
                sendDeleteSetting(this);
                
                //send delete object to all listeners
                parent.__invokeListeners(1, ["delete", this[proxyKey], this[nameKey]]);

                //send general deleteSetting event
                $EventHandler.trigger("deleteSetting:post", $Settings, {setting: this[proxyKey]})
            }
        }
        
        //class property methods
        __isClassProperty(property, value, classPropertyList){
            if(!classPropertyList) classPropertyList = this[classPropertiesKey]
            
            if(classPropertyList)
                if(SyncedArray.isValidArray(value) || SyncedObject.isValidObject(value)){
                    //create list of paths classProperties from the provided property
                    var classPropertyListOut = [];
                    for(var classProperty of classPropertyList[1]){
                        var parts = classProperty.split(".");
                        if((parts[0]==property || parts[0]=="*") && parts.length>1){               
                            parts.shift();
                            classPropertyListOut.push(parts.join("."));
                        }
                    }
                    return classPropertyListOut;
                }else if(typeof value == "string"){
                    //check if the provided property can be a class
                    return classPropertyList[2] || classPropertyList[0].indexOf(property)!=-1;
                }
            //if no classProperties were provided, no property can be a class property
            return false;
        }
        __addToClassPropertyList(list){
            var propertyAr = [[],[]];
            for(var classProperty of list){
                var parts = classProperty.split(".");
                if(parts.length==1)
                    if(parts[0]=="*")   propertyAr[2] = true;
                    else                propertyAr[0].push(classProperty);
                else                    propertyAr[1].push(classProperty);
            }
            
            //update properties of object
            for(var key in this){
                var isClassProperty = this.__isClassProperty(key, this[key], propertyAr);
                if(typeof isClassProperty == "boolean"){    //is class property
                    if(isClassProperty){                            
                        var scriptReturn = $ScriptLoader.loadOnce(this[key]);
                        if(scriptReturn) this[key] = scriptReturn;                    
                    }
                }else if(this[key].__addToClassPropertyList){ //child object/array might contain an classPath, and isClassProperty is actually an array of possible child classes
                    this[key].__addToClassPropertyList(isClassProperty);
                }
            }
            
            //add new items to the classProperty array
            this[classPropertiesKey][0] = this[classPropertiesKey][0].concat(propertyAr[0]);
            this[classPropertiesKey][1] = this[classPropertiesKey][1].concat(propertyAr[1]);
            this[classPropertiesKey][2] = this[classPropertiesKey][2] || propertyAr[2];
        }
        setPropertyAsClass(propertyPaths, dontAddToChildren){
            if(propertyPaths){                
            	//convert propertyPaths to an array if only 1 path was provided
                if(!(propertyPaths instanceof Array)) propertyPaths = [propertyPaths];
                
                //prepend the propertyIndicator if not present
                for(p in propertyPaths)
                	if(propertyPaths[p][0]!=propertyIndicator)
                		propertyPaths[p][0] = propertyIndicator+propertyPaths[p][0];
                
                //add classPropertyPaths to setting's classProperty list
                this.__addToClassPropertyList(propertyPaths);
                
                //add the propertyPaths to children if not disabled
                if(!dontAddToChildren)
                    for(var setting of this.getChildrenList())
                        setting.setPropertyAsClass(propertyPaths, dontAddToChildren);
            }
        }
        
        //private methods
        __setExternalChange(val){
            if(val)
                this[externalChangeIndicator] = true;
            else
                delete this[externalChangeIndicator];
        }
        __validateCurrentValue(){
            if(this.value==null || !this.isValueValid(this.value).success){
                var copy = $CommunicationUtils.copy(this[defaultValueName]); //copy the value, so that changing the value never affects the defaultValue
                this.setValue(copy);
            }
        }
        __propertyChange(changeType, path, newValue, oldValue, directProperty){
            var parts = path.split(".");
            var returnVal = newValue;
            if(parts[0]==validationsName){
                //update value if needed
                this.__validateCurrentValue();
                
                //make sure the values follow the validationType: {value:validationValue} structure
                if(parts.length==2){                //update individual type
                    var prop = this[validationsName];
                    returnVal = {value:newValue};
                    if(prop)
                        prop.setProperty(parts[1], returnVal, true);
                }else if(parts.length==1){          //fix entire validation object
                    var validations = this[validationsName];
                    for(var validationType of Object.keys(validations)){
                        var t = validations.getProperty(validationType);
                        validations.setProperty(validationType, {value:t}, true);
                    }
                    returnVal = this[validationsName];
                }
            }
            return returnVal;
        }
        
        //listener functions
        addListener(func){
            if(!(this[listenersKey] instanceof Array)) this[listenersKey] = [[], [], []]; //create listeners array if it doesn't already exist
            
            if($EventHandler.trigger("addListener:pre", $Settings, {setting: this[proxyKey], listener: func})){
                this[listenersKey][0].push(func);
                $EventHandler.trigger("addListener:post", $Settings, {setting: this[proxyKey], listener: func});
            }
        }
        removeListener(func){
            if(this[listenersKey] instanceof Array){
                var index = this[listenersKey][0].indexOf(func);
                
                if($EventHandler.trigger("removeListener:pre", $Settings, {setting: this[proxyKey], listener: func, index:index}))
                    if(index>-1){
                        this[listenersKey][0].splice(index, 1);
                        $EventHandler.trigger("removeListener:post", $Settings, {setting: this[proxyKey], listener: func, index:index});
                    }
            }
        }
        addChildrenListener(func){
            if(!(this[listenersKey] instanceof Array)) this[listenersKey] = [[], [], []]; //create listeners array if it doesn't already exist
            
            if($EventHandler.trigger("addChildrenListener:pre", $Settings, {setting: this[proxyKey], listener: func})){
                this[listenersKey][1].push(func);
                $EventHandler.trigger("addChildrenListener:post", $Settings, {setting: this[proxyKey], listener: func});
            }
        }
        removeChildrenListener(func){
            if(this[listenersKey] instanceof Array){
                var index = this[listenersKey][1].indexOf(func);
                
                if($EventHandler.trigger("removeChildrenListener:pre", $Settings, {setting: this[proxyKey], listener: func, index:index}))
                    if(index>-1){
                        this[listenersKey][1].splice(index, 1);
                        $EventHandler.trigger("removeChildrenListener:post", $Settings, {setting: this[proxyKey], listener: func, index:index});
                    }
            }
        }
        addPropertyListener(func){
            if(!(this[listenersKey] instanceof Array)) this[listenersKey] = [[], [], []]; //create listeners array if it doesn't already exist

            if($EventHandler.trigger("addPropertyListener:pre", $Settings, {setting: this[proxyKey], listener: func})){
                this[listenersKey][2].push(func);
                $EventHandler.trigger("addPropertyListener:post", $Settings, {setting: this[proxyKey], listener: func});
            }
        }
        removePropertyListener(func){
            if(this[listenersKey] instanceof Array){
                var index = this[listenersKey][2].indexOf(func);
                
                if($EventHandler.trigger("removeListener:pre", $Settings, {setting: this[proxyKey], listener: func, index:index}))
                    if(index>-1){
                        this[listenersKey][2].splice(index, 1);
                        $EventHandler.trigger("removeListener:post", $Settings, {setting: this[proxyKey], listener: func, index:index});
                    }
            }
        }
        __invokeListeners(type, args){
            //set externalChangeIndicator to false, so that listeners will forward their changes
            var oldExternalChange = this[externalChangeIndicator];
            this.__setExternalChange(false);
            
            //check if there are any listeners
            if(this[listenersKey]){
                //send any property changes to internal method
                if(type==2){
                    args[2] = this.__propertyChange.apply(this, args);
                }
                
                //go through all listeners and invoke them
                for(var i=0; i<this[listenersKey][type].length; i++){
                    var f = this[listenersKey][type][i];
                    if(f instanceof Function)
                        try{
                            f.apply(this[proxyKey], args);
                        }catch(e){
                            console.error(e);
                        }
                }
            }
            
            //restore previous externalChangeIndicator
            this.__setExternalChange(oldExternalChange);
        }
        
        //utility methods
        getChildrenObject(settingsOnly, categoriesOnly){
            var obj = {};
            var keys = Object.keys(this);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = this[key];
                if(key[0]!=propertyIndicator && key!="value" && val && 
                        (!settingsOnly || val.value!==undefined) && (!categoriesOnly || val[hasChildrenKey]))
                    obj[key] = val;
            }
            
            return obj;
        }
        getChildrenList(settingsOnly, categoriesOnly){
            return Object.values(this.getChildrenObject(settingsOnly, categoriesOnly));
        }
        getPath(from$Settings){        
            var path = this[nameKey];
            if(this[parentKey]){
                if(!from$Settings || this[parentKey][parentKey])
                    path = this[parentKey].getPath(from$Settings)+"."+path;
            }
            return path;            
        }
        getParent(){
            return this[parentKey];
        }
        getSettingFromPath(path){
            var parts = path.split(".");
            if(parts[0]==this[nameKey]) parts.shift();
            
            var out = this[proxyKey];
            for(var part of parts){
                if(part.length>0)
                    out = out[part];
            }
            return out;
        }
        getObject(withSymbols){
            var out = {};
            this[convertingKey] = out; //prevent infinite recursion
            
            //retrieve keys
            var keys = Object.keys(this);
            if(withSymbols) keys = kes.concat(Object.getOwnPropertySymbols(this));
            
            //loop through keys
            for(var key of keys){
                var val = this[key];
                if(val instanceof Object && val!=null && val[convertingKey]){
                    out[key] = val[convertingKey]; 
                }else if((val instanceof Setting) || (val instanceof SyncedObject) || (val instanceof SyncedArray)){
                    out[key] = val.getObject(withSymbols);
                }else{
                    out[key] = val;
                }
            }
            
            delete this[convertingKey];
            return out;
        }
        
        //saving methods
        getValues(){
            var obj = {};
            if(this.value!==undefined && this[propertyIndicator+"defaultValue"])
                obj.value = this.value; 
            
            //go through all child settings
            var keys = Object.keys(this);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = this[key];
                if(key[0]!=propertyIndicator){
                    //add values of child settings
                    if(val instanceof Setting)
                        obj[key] = val.getValues();
                }
            }
            return obj;
        }
        setValues(obj){
            this.setData(obj, true);
        }
        setData(obj, onlyValues){
            if($EventHandler.trigger("setData:pre", $Settings, {setting:this[proxyKey], data:obj, valuesOnly:onlyValues})){
                //loop through object
                var keys = Object.keys(obj);
                for(var i=0; i<keys.length; i++){
                    var key = keys[i];
                    var val = obj[key];
                    
                    if(key=="value"){ //if key is value, set value
                        this.setValue(val);
                    }else if(key[0]==propertyIndicator && !onlyValues){ //if key is property, set property, skip if 'onlyValues' is set to true
                        this.setProperty(key, val);
                    }else{ //else, key is childSetting, createChild if non existent, set data to child
                        if(typeof val=="string"){
                            var copiedSetting = $Settings.getSettingFromPath(val);
                            this.createChildSettingCopy(key, copiedSetting);
                            console.log(val);
                        }else{                            
                            if(!this[key])
                                this.createChildSetting(key);    
                            
                            this[key].__setExternalChange(this[externalChangeIndicator]);
                            this[key].setData(val, onlyValues);
                            this[key].__setExternalChange(false);
                        }
                    }
                }
                $EventHandler.trigger("setData:post", $Settings, {setting:this[proxyKey], data:obj, valuesOnly:onlyValues});
            }    
        }
        toString(){
            return this.getString();
        }
        getString(){
            return JSON.stringify(this.getValues(), null, 4).replace(/\n/g, '\r\n');
        }
        setString(str){
            if($EventHandler.trigger("setString:pre", $Settings, {setting:this[proxyKey], string:str})){            
                this.setValues(JSON.parse(str));
                $EventHandler.trigger("setString:post", $Settings, {setting:this[proxyKey], string:str});
            }
        }
        
        //static methods
        static getSymbol(name){
            if(name=="externalChange") return externalChangeIndicator;
            if(name=="parent") return parentKey;
            if(name=="name") return nameKey;
            if(name=="listeners") return listenersKey;
            if(name=="proxy") return proxyKey;
            if(name=="target") return targetKey;
            if(name=="hasChildren") return hasChildrenKey;
            if(name=="converting") return convertingKey;
            if(name=="classProperties") return classPropertiesKey;
            if(name=="updateSetting") return updateSettingKey;
            if(name=="constants") return constantsKey;
        }
        static createSettingProxy(setting){
            return proxy(setting);
        }
        static getSendHostMethods(){
            return {
                setValue: sendSetValue,
                setProperty: sendSetProperty,
                createSetting: sendCreateSetting,
                deleteSetting: sendDeleteSetting
            }
        }
        static createProxiedSetting(){
            return this.createSettingProxy(new Setting(...arguments));
        }
        static setPropertyOrderIndex(property, index){
            property = (property[0]==propertyIndicator?"":propertyIndicator)+property;
            
            //remove old property index
            var oldIndex = propertyOrder.findIndex(function(n){return n[0]==property});
            if(oldIndex>-1) propertyOrder.splice(oldIndex, 1);
            
            //add propert and sort the list
            propertyOrder.push([property, index]);
            propertyOrder.sort(function(a, b){
                return a[1]-b[1];
            });
        }
    }
    Setting.propertyIndicator = propertyIndicator;
    
    //create proxy to shorten specific methods
    const proxy = function(setting){
        var p = new Proxy(setting, {
            set: function(target, property, value){
                var currentValue = target[property];
                var setValueReturn;
                if(property=="value"){ //call setValue when setting the value; category.setting.value = val
                    setValueReturn = target.setValue(value);
                }else if(property[0]==propertyIndicator){ //call setProperty when defining a variable whose name starts with _; category.setting._defaultValue = 1 
                    target.setProperty(property, value);
                }else if(currentValue instanceof Setting){ //call setValue or definition when overwriting the setting; category.setting = val
                    if(value instanceof Setting || value instanceof SettingCopy)
                        target.createChildSettingCopy(property, value);
                    else if(value instanceof Object)
                        currentValue.setDefinition(value);
                    else
                        setValueReturn = currentValue.setValue(value);
                }else if(currentValue===undefined && !(typeof property=="symbol" || property[0]==propertyIndicator)){ 
                    if(value instanceof Setting || value instanceof SettingCopy)
                        target.createChildSettingCopy(property, value);
                    else{                        
                        var setting = target.createChildSetting(property); //call setValue or definition when overwriting a non existent setting; category.setting = val
                        if(value instanceof Object)
                            setting.setDefinition(value);
                        else
                            setValueReturn = setting.setValue(value);
                    }
                }else{                                        //straight up define the variable if none of the above are applicable
                    target[property] = value;
                }
                
                //if attempting to change the value returned an error, log it in the console
                if(setValueReturn && !setValueReturn.success)
                    console.error(setValueReturn.message);
                
                return true;
            },
            get: function(target, property){
                var val = target[property];
                
                //check for special cases
                if(val instanceof Function){ //wrap functions of settings
                    //set function thisArg to target, so this within the function refers to the object directly, not the proxy
                    return val.bind(target);
                }
                
                //if the value is undefined, check if it is defined in the setting value
                if(val===undefined && target.value) val = target.value[property];
                if(val instanceof Function){ //wrap functions of setting.value
                    //set function thisArg to target.value, so this within the function refers to the proper object
                    return val.bind(target.value);
                }
                
                if(val===undefined && //create category if property isn't defined, and doesn't start with the propertyIndicator or is a symbol
                        !(typeof property=="symbol" || property[0]==propertyIndicator || property=="value")){
                    return target.createChildSetting(property);
                }
                
                //return the normal variable if it isn't a special case
                return val;
            },
            deleteProperty: function(target, property){
                var val = target[property];
                if(val instanceof Setting){//dispose child settings properly
                    val[targetKey].delete();
                }else if(val instanceof SettingCopy){//dispose child settingCoopies properly
                    val[settingCopyTargetKey].delete();
                }else if(typeof property=="symbol"){
                    delete target[property];
                }else{
                    target.deleteProperty(property);
                }
                return true;
            }
        });
        setting[proxyKey] = p;
        return p;
    }
    loadOnce("SettingCopy");
    loadOnce("SyncedObject");
    loadOnce("SyncedArray");
    loadOnce("/communication/$CommunicationUtils");
    
    copyingSettingsKey = SettingCopy.getSymbol("copyingSettings");
    settingCopyTargetKey = SettingCopy.getSymbol("target");
})();