loadOnce("Setting");
loadOnce("/communication/$CommunicationUtils");
(function(){
    const externalChangeIndicator = Setting.getSymbol("externalChange");
    const parentKey = Setting.getSymbol("parent");
    const nameKey = Setting.getSymbol("name");
    const proxyKey = Setting.getSymbol("proxy");
    const targetKey = Setting.getSymbol("target");
    const classPropertiesKey = Setting.getSymbol("classProperties");
    const convertingKey = Setting.getSymbol("converting");
    const updateSettingKey = Setting.getSymbol("updateSetting");
    const constantsKey = Setting.getSymbol("constants");
    
    //synchronisation functions
    const sendSetProperty = function(parentSetting, object, property, value){
        if(!parentSetting[externalChangeIndicator])
            $Settings.__sendUpdate({type:"changeProperty", data:{settingPath: parentSetting.getPath(true),
                                                                 objectPath: object.getPath(false, true),
                                                                 property: property, 
                                                                 value: $CommunicationUtils.encodeClassData(value)}});
    };
    const sendDeleteProperty = function(parentSetting, object, property){
        if(!parentSetting[externalChangeIndicator])
            $Settings.__sendUpdate({type:"deleteProperty", data:{settingPath: parentSetting.getPath(true),
                                                                 objectPath: object.getPath(false, true),
                                                                 property: property}});
    };
//    const sendCreateObject = function(parentSetting, object){
//        if(!parentSetting[externalChangeIndicator])
//            ipc.send("settingChange", {type:"createObject", data:{settingPath: parentSetting.getPath(true),
//                                                                  objectPath: object.getPath(false, true)}});
//    };
    const sendDeleteObject = function(parentSetting, object){
        if(!parentSetting[externalChangeIndicator])
            $Settings.__sendUpdate({type:"deleteObject", data:{settingPath: parentSetting.getPath(true),
                                                               objectPath: object.getPath(false, true)}});
    };

    //object class
    window.SyncedArray = class SyncedArray extends Array{        
        constructor(){
            super();
            this[targetKey] = this;
        }
        init(name, parent, data){
            if(typeof name=="string"){                
                this[nameKey] = name;
                this[parentKey] = parent;
            }else{
                data = name;
            }
            
            //set object values
            if(data)
                this.setData(data, true);
        }
        setData(data, dontSendEvents){
            //indicate that this object is converting, and set the path so it can be used for retreiving the object
            var path = this.getPath(false, true).split(".");
            path.shift();
            data[convertingKey] = path.join(".");
            
            //go through all data properties
            var keys = Object.keys(data).concat(Object.getOwnPropertySymbols(data));
            for(var key of keys){
                var val = data[key];
                if(key!=convertingKey){                    
                    if(val && val[convertingKey]){
                        //retrieve root object
                        var rootObj = this;
                        var lengthToRoot = data[convertingKey].split(".").length;
                        for(var i=0; i<lengthToRoot; i++) rootObj = rootObj[parentKey];
                        
                        //get object from path
                        var obj = rootObj;
                        for(var part of val[convertingKey].split("."))
                            if(part.length>0 && obj!==undefined)
                                obj = obj[part];
                        
                        //set property to object at path
                        this.setProperty(key, obj, dontSendEvents);
                    }else{
                        this.setProperty(key, val, dontSendEvents);                        
                    }
                }
            }
            
            //clean up data
            delete data[convertingKey];
        }
        
//        //proxy methods
//        createChildObject(name, data){
//            var parentSetting = this.getParentSetting();
//            var isExternal = parentSetting[externalChangeIndicator];
//            if(isExternal || $EventHandler.trigger("createChildObject:pre", $Settings, {parent:this[proxyKey], name:name})){
//                //create object
//                var object = SyncedObject.createProxiedSyncedObject(name, this[proxyKey]);                
//                this[name] = object;
//                
//                //sync with other windows settings
//                sendCreateObject(parentSetting, object);
//
//                //send new object to all listeners
//                parentSetting.__invokeListeners(2, [object.getPath(false, true), this[name], null, "create"]);
//
//                //send general createObject event
//                $EventHandler.trigger("createChildObject:post", $Settings, {object: this[name]});
//                
//                //copy all data over from the object
//                if(data)
//                    object.setData(data);
//                return this[name];
//            }
//        }
        setProperty(property, value, objectInitialisation){
            var parentSetting = this.getParentSetting();
            var isExternal = objectInitialisation || parentSetting[externalChangeIndicator];
            var oldValue = this[property];
            var eventData = {
                object: this[proxyKey], 
                property: property, 
                currentValue:oldValue, 
                newValue:value
            };
            if(isExternal || objectInitialisation || $EventHandler.trigger("setObjectProperty:pre", $Settings, eventData)){
                //set property
                if(value==null || value[proxyKey] || (typeof property=="symbol")){ //don't try to create a proxy from an object that is a proxy already, and don't convert symbols
                    this[property] = value;
                }else if(value[$CommunicationUtils.encodeSymbol]){                 //set any transferable object
                    this[property] = value;
                }else if(SyncedArray.isValidArray(value)){                         //set proxyable array
                    this[property] = SyncedArray.createProxiedSyncedArray();
                    this[property].init(property, this[proxyKey], value);
                }else if(SyncedObject.isValidObject(value)){                       //set proxyable object
                    this[property] = SyncedObject.createProxiedSyncedObject();
                    this[property].init(property, this[proxyKey], value);
                }else{                                                             //set any other value
                    this[property] = value;
                }
                
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
                
                if(!objectInitialisation){                    
                    //sync with other windows settings
                    sendSetProperty(parentSetting, this, property, this[property]);
                    
                    //change class path to class if applicable
                    var isClassProperty = this.__isClassProperty(property, value);
                    if(typeof isClassProperty == "boolean"){    //is class property
                        if(isClassProperty){
                            var scriptReturn = $ScriptLoader.loadOnce(this[property]);
                            if(scriptReturn) this[property] = scriptReturn;                    
                        }
                    }else if(this[property].__setClassPropertyList){ //child object/array might contain an classPath, and isClassProperty is actually an array of possible child classes
                        this[property].__setClassPropertyList(isClassProperty);
                    }
                    
                    //send setProperty to all listeners 
                    parentSetting.__invokeListeners(2, ["property", this.getPath(false, true)+"."+property, this[property], oldValue]);
                    
                    //send general setProperty event
                    var eventData = {
                            object: this[proxyKey], 
                            property: property, 
                            oldValue:oldValue, 
                            value:value
                    };
                    $EventHandler.trigger("setObjectProperty:post", $Settings, eventData)
                }
            }    
        }
        deleteProperty(property, value){
            var parentSetting = this.getParentSetting();
            var isExternal = parentSetting[externalChangeIndicator];
            var oldValue = this[property];
            var eventData = {
                object: this[proxyKey], 
                property: property, 
                currentValue:oldValue
            };
            if(isExternal || $EventHandler.trigger("deleteObjectProperty:pre", $Settings, eventData)){
                //delete property
                delete this[property];
                
                //sync with other windows settings
                sendDeleteProperty(parentSetting, this, property);
                
                //send deleteProperty to all listeners
                parentSetting.__invokeListeners(2, ["delete", this.getPath(false, true)+"."+property, undefined, oldValue]);
                
                //send general deleteProperty event
                var eventData = {
                    object: this[proxyKey], 
                    property: property, 
                    oldValue:oldValue
                };
                $EventHandler.trigger("deleteObjectProperty:post", $Settings, eventData)
            }    
        }
        getProperty(property){            
            //go through all parts of the property string and get the final property
            var parts = property.split(".");
            var out = this[proxyKey];
            for(var part of parts){
                out = out[part];
            }
            
            return out;
        }
        delete(){
            var parentSetting = this.getParentSetting();
            var isExternal = parentSetting[externalChangeIndicator];
            if(isExternal || $EventHandler.trigger("deleteChildObject:pre", $Settings, {object:this[proxyKey]})){
                //delete object
                var object = parentSetting[this[nameKey]];
                delete parentSetting[this[nameKey]];
                
                //sync with other windows settings
                sendDeleteObject(parentSetting, this);
                
                //send delete object to all listeners
                parentSetting.__invokeListeners(2, [object.getPath(false, true), object, null, "delete"]);
                
                //send general deleteObject event
                $EventHandler.trigger("deleteChildObject:post", $Settings, {object:this[proxyKey]})
            }    
        }


        __isClassProperty(property, value, classPropertyList){
            if(!classPropertyList) classPropertyList = this[classPropertiesKey];
            
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
                }else{
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
            
            this[convertingKey] = true; //prevent recursion
            
            //update properties of object
            for(var key in this){
                var isClassProperty = this.__isClassProperty(key, this[key], propertyAr);
                if(typeof isClassProperty == "boolean"){    //is class property
                    if(isClassProperty){                            
                        var scriptReturn = $ScriptLoader.loadOnce(this[key]);
                        if(scriptReturn) this[key] = scriptReturn;                    
                    }
                }else if(this[key].__addToClassPropertyList && !this[key][convertingKey]){
                    //child object/array might contain an classPath, and isClassProperty is actually an array of possible child classes
                    this[key].__addToClassPropertyList(isClassProperty);
                }
            }
            
            delete this[convertingKey];
            
            //add new items to the classProperty array
            if(!this[classPropertiesKey])     this[classPropertiesKey] = propertyAr;
            else{                
                this[classPropertiesKey][0] = this[classPropertiesKey][0].concat(propertyAr[0]);
                this[classPropertiesKey][1] = this[classPropertiesKey][1].concat(propertyAr[1]);
                this[classPropertiesKey][2] = this[classPropertiesKey][2] || propertyAr[2];
            }
        }
        __setClassPropertyList(list){
            if(list){
                //define list of possible classes
                this[classPropertiesKey] = [[],[]];
                this.__addToClassPropertyList(list)
            }else{
                delete this[classPropertiesKey];
            }
        }

        //utility methods
        getParentSetting(){
            var s = this;
            while(!(s instanceof Setting)) s = s[parentKey];
            return s;
        }
        getPath(from$Settings, fromSetting){        
            var path = this[nameKey];
            if(this[parentKey]){
                //check if you haven't reached $Settings or a setting yet if one of either is set to true
                if((!from$Settings || this[parentKey][parentKey]) && 
                    (!fromSetting || !(this[parentKey] instanceof Setting)))
                    path = this[parentKey].getPath(from$Settings, fromSetting)+"."+path;
            }
            return path;            
        }
        getParent(){
            return this[parentKey];
        }
        getPropertyFromPath(path){
            var parts = path.split(".");
            if(parts[0]==this[nameKey]) parts.shift();
            
            var out = this[proxyKey];
            for(var part of parts){
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
                }else if((val instanceof SyncedObject) || (val instanceof SyncedArray)){
                    out[key] = val.getObject(withSymbols); 
                }else{
                    out[key] = val;
                }
            }
            
            delete this[convertingKey];
            return out;
        }
        
        //static methods
        static getSymbol(name){
            return Setting.getSymbol(name);
        }
        static createArrayProxy(arrayObject){
            return proxy(arrayObject);
        }
        static getSendHostMethods(){
            return {
                setProperty: sendSetProperty,
//                createObject: sendCreateObject,
                deleteProperty: sendDeleteProperty,
                deleteObject: sendDeleteObject
            }
        }
        static isValidArray(object){
            return object instanceof Array;
        }
        static createProxiedSyncedArray(name, parent, object){
            var syncedArray = new SyncedArray();
            var proxy = this.createArrayProxy(syncedArray);
            //only initialize after the array contains a proxyKey, as some methods depend on it
            if(name)
                syncedObject.init(name, parent, object);
            return proxy;
        }
    }
    
    //create proxy to forward any object changes
    const proxy = function(syncedArray){
        var p = new Proxy(syncedArray, {
            set: function(target, property, value){
                if(typeof property=="symbol"){
                    target[property] = value;
//                }else if(value instanceof Object){
//                    target.createChildObject(property, value);
                }else{
                    target.setProperty(property, value);
                }
                return true;
            },
            get: function(target, property){
                var val = target[property];
                if(val instanceof Function){
                	//set function thisArg to proxy, so any alterations made by the Array object will be forwarded
                    if(Array.prototype[property])
                        return val.bind(target[proxyKey]);
                    //set function thisArg to target, so this within the function refers to the object directly, not the proxy
                    return val.bind(target);
                }else{
                    return val;
                }
            },
            deleteProperty: function(target, property){
                var val = target[property];
                if((val instanceof SyncedObject) || (val instanceof SyncedArray)){ //dispose child object properly
                    val.delete();
                }else if(typeof property=="symbol"){
                    delete target[property];
                }else{
                    target.deleteProperty(property);
                }
                return true;
            }
        });
        syncedArray[proxyKey] = p;
        return p;
    };
})();