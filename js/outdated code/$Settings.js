loadOnce("/$Utils");
loadOnce("/communication/$CommunicationUtils");
$ScriptLoader.loadDir("new settings");
window.$SettingsOld = (function(){
    /* Settings format        all the properties are optional
     * 
     * defaultValue:                             (the default value of the setting, if it hasn't been altered)
     * validation: {                            (the value validation for when someone attempts to alter it)
     *         regex: RegExp |                        
     *            {
     *                value:RegExp,
     *                errorMessage:"valueGuideLines"
     *            }
     *        type: "valueType"                
     *        min: Number |
     *            {
     *                value: Number,
     *                errorMessage:"valueGuideLines"
     *            }
     *        max: Number |
     *            {
     *                value: Number,
     *                errorMessage:"valueGuideLines"
     *            }
     *        decimals: Number|
     *            {
     *                value: Number,
     *                errorMessage:"valueGuideLines"
     *            }
     *        custom: function(value, setting)    (A custom validation function, should return an error message to indicate validation failed and nothing if it succeeded)
     * } 
     * 
     * GUI related properties:
     * GUIclass: class                            (The class to use when generating the settings GUI)
     * 
     * settingIndex: Integer                    (A number to indicate the ordering of the settings in the settings GUI)
     * settingInvisible: Boolean                (If this element should be added to the settings GUI)
     * settingDisabled: Boolean                    (If this setting is disabled, and should not be alterable, but still visible in the GUI)
     * settingSpacing: Boolean | Number            (If this setting is set to true, there will be some space between this setting and the next setting)
     * settingDisplayName: "name"                (The name that should be displayed for this setting in the GUI)
     * settingVisibilityCheck: {
     *         settings: ["settingPath1","2"],
     *         func: function(settingVal1, val2)
     *     }                                        (A function to update a settings visibility based on other setting values)
     * settingHelpMessage: "description" | 
     *                         { 
     *                             html: ``,
     *                             style: ``
     *                         } |
     *                         HTMLElement class    (A description what this setting is used for)
     * 
     * categoryIndex: integer                    (A number to indicate the ordering of the category in the navigation GUI)
     * categoryInvisible: Boolean                (If this element should be added to the navigation GUI)
     * categoryDisplayName: "name"                (The name that should be displayed for this category in the GUI)
     * #categoryPushSettings: Boolean            (child settings will be added to settings area, when this category is added, instead of just when the category is selected)
     * 
     * properties with # are not fully implemented, and might be buggy, they will be fully implemented when the Settings are being refactored
     * settingVisibilityCheck doesn't live update for instance
     * 
     * TODO:
     * categoryDescription: "description"|htmlTemplate    (A description what this category is used for)
     * update Category.list() to show all relevant properties 
     * make settings easily navigateable with keyboard
     */
    
    //test code:
//        $Settings.load();
//        $Settings.stuff.something.inner.inner._defaultValue = "sh0it";
//        $Settings.poop.color = {
//            defaultValue: "orange",
//            type: "color"    
//        };
//        $Settings.poop.button = {
//            type: "button",
//            text: ["shit", "poop"],
//            func: [function(){
//                console.log("detect crap");
//            }, function(){
//                console.log("detect crap2");
//            }]
//        }
//        $Settings.poop.something._defaultValue = true;
//        $Settings.poop.spoop = {
//            defaultValue: 10,
//            validations: {
//                min: 0,
//                max: {
//                    value:20,
//                    errorMessage: "you suck"
//                },
//                decimals: 2,
//            },
//            settingVisibilityCheck:{
//                settings: ["poop.something"],
//                func: function(val){
//                    return val;
//                }
//            }
//        };
//        $Settings.poop.something._settingHelpMessage = class shitElementClass extends BaseElementClass{
//            __initVars(){
//                super.__initVars();
//                this.template = {html: "some custom <span>class</span>", 
//                                style: "span{background-color:purple;}"};
//            }
//        }
//        $Settings.poop.stuff._defaultValue = "things";
//        $Settings.poop.stuff._validations = {regex: /^t/};
//        $Settings.poop.stuff._settingHelpMessage = {html: "some super <span>simple message</span>", style: "span{background-color:orange;}"};
//        $Settings.stuff._categoryIndex = 2;
//        $Settings.poop._categoryIndex = 1;
//        new SettingsWindowController();

    
    //variable validation functions
    var validationTypes = {
        "type": {
                    func: function(validationValue, value, setting){
                        if(typeof(value)!=validationValue)
                            return "value must be of type "+validationValue;
                    }
                },
        "regex":{
                    func: function(validationValue, value, setting){
                        if(!value.match(validationValue))
                            return "value must match the regular expression "+validationValue;
                    },
                    type: "string"
                },
        "min":    {
                    func: function(validationValue, value, setting){
                        if(value<validationValue)
                            return "value must be greater than or equal to the minimum of "+validationValue;
                    },
                    type: "number"
                },
        "max":    {
                    func: function(validationValue, value, setting){
                        if(value>validationValue)
                            return "value must be smaller than or equal to the maximum of "+validationValue;
                    },
                    type: "number"
                },
        "decimals":{
                    func: function(validationValue, value, setting){
                        var n = Math.pow(10, validationValue);
                        if(Math.round(value*n)/n!=value)
                            return "value must have "+validationValue+" decimals";
                    },
                    type: "number"
                },
        "custom":{
                    func: function(validationValue, value, setting){
                        return validationValue(value, setting);
                    }
                },
    };
    
    const fs = require("fs");
    const ipc = require('electron').ipcRenderer;
    const path = $Utils.fixPath($Utils.dataPath()+"Settings.txt");
    
    //code to keep settings between browser windows synchronized
    const sendHost = function(type, data){
        ipc.send("settingChange", {type:type, data:data});
    };
    var externalChange = false;
    const getObject = function(path){
        var nodeNames = path.split(/\./);
        if(nodeNames[0]==='') return s;
        
        var node = s;
        for(var i=0; i<nodeNames.length; i++){
            node = node[nodeNames[i]];
        }
        return node;
    }
    const settingsChange = function(event, data){
        const addCategory = function(name, parent, data){
            parent[name] = {};
            var obj = parent[name];
            var keys = Object.keys(data);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                
                if(key[0]=="_"){    
                    externalChange = true; 
                    obj[key] = $CommunicationUtils.decodeClassData(data[key]);
                }else if(key=="value"){    
                    externalChange = true; 
                    obj.value = data.value;
                }else{
                    addCategory(key, obj, data[key]);
                }
            }
            return obj
        };
        
        externalChange = true; //gets set back to false by the proxy, so it will only target 1 change
        if(data.type=="categoryCreate"){
            var nodeNames = data.data.path.split(/\./);
            var categoryName = nodeNames.pop();
            var parentCategory = getObject(nodeNames.join("."));
            parentCategory[categoryName];
        }else if(data.type=="categoryDelete"){
            var parentPath = data.data.path.split(/\./);
            var name = parentPath.pop();
            var parent = getObject(parentPath.join("."));
            
            delete parent[name];
        }else if(data.type=="valueChange"){
            var category = getObject(data.data.path);
            category.setValue.apply(category, [data.data.value].concat(data.data.args));
        }else if(data.type=="propertyChange"){         //when a single _property changes (things like a validation property)
            var object = getObject(data.data.path);
            object[data.data.property] = $CommunicationUtils.decodeClassData(data.data.value);
        }else if(data.type=="getSettings"){
            var keys = Object.keys(data.data);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                if(key[0]!="_" && key!="value"){    
                    addCategory(key, s, data.data[key]);
                }
            }
            if(keys.length==0){
                externalChange = false;
                s.load(); //only load the settings from file on initial setup
            }
        }
        externalChange = false;
    }
    
    //setup settings listener
    ipc.on("settingChange", settingsChange);

    categoryProxies = []; //way of linking the proxy to the category, instead of only having the category linked to the proxy
    const getCategoryProxy = function(category){
        var obj =categoryProxies.find(function(n){return n[0]==category}); 
        return obj?obj[1]:category;
    }
    
    const changingValue = Symbol("changingValue");
    //value functions
    class Category{
        [Symbol.toPrimitive](){
            if(this.value!==undefined)
                return this.value;
            return this.getString();
        }
        setValue(value){
            //make sure it doesn't recurse because of the 'this.value = value', 
            //because sometimes setValue is used on the proxy, and sometimes on the object
            if(!this[changingValue]){
                this[changingValue] = true;

                var oldValue = this.value;
                
                //find setting proxy 
                var settingProxy = getCategoryProxy(this);
//                console.log("send listeners");
                
                var args = $.extend([], arguments);
                args.shift();
                if(externalChange || $EventHandler.trigger("setValue:pre", s, {setting:settingProxy, 
                                                                                newValue:value,
                                                                                currentValue:oldValue,
                                                                                args: args})){
                    if(value!=this.value){                    
                        //check if the value meets all conditions
                        if(this._validations){
                            var resp = isValueValid(this, value, oldValue);
                            if(!resp.success)
                                return resp;                    
                        }
                        
                        //set value and events
                        this.value = value;
                        if(!externalChange)
                            sendHost("valueChange", {path:this.getPath(true), value:value, args:args});
                        if(this._listeners){
                            for(var i=0; i<this._listeners.length; i++){
                                var f = this._listeners[i];
                                f.apply(settingProxy, [value, oldValue].concat(args));
                            }
                        }                        
                        
                        $EventHandler.trigger("setValue:post", s, {setting:settingProxy, 
                            value:value, 
                            oldValue:oldValue,
                            args: args});
                    }
                }
                
                delete this[changingValue];
            }else{
                this.value = value;
            }
        }
        isValueValid(value){
            return isValueValid(this, value, this.value, true);
        }
        addChildSetting(name){
            this[name] = createCategory(name, this);
            
            //send new category to all listeners    
            if(this._listeners && this._listeners.childrenListeners){
                for(var i=0; i<this._listeners.childrenListeners.length; i++){
                    var f = this._listeners.childrenListeners[i]; 
                    f.call(getCategoryProxy(this), "create", this[name], name);
                }
            }
            
            //send category creation to other windows
            if(!externalChange)
                sendHost("categoryCreate", {path:this[name].getPath(true)});
            
            //send createSetting event
            $EventHandler.trigger("createSetting:post", s, {setting: this[name]});
            return this[name];
        }
        
        //adding/removing listeners
        addListener(func){
            if(typeof func == "function"){
                var settingProxy = getCategoryProxy(this);
                if($EventHandler.trigger("addListener:pre", s, {setting: settingProxy, listener: func})){
                    if(!this._listeners) this._listeners = [];
                    this._listeners.push(func);            
                    
                    $EventHandler.trigger("addListener:post", s, {setting: settingProxy, listener: func});
                }
            }
        }
        removeListener(func){
            if(this._listeners){
                var settingProxy = getCategoryProxy(this);
                var index = this._listeners.indexOf(func);
                if($EventHandler.trigger("removeListener:pre", s, {setting: settingProxy, listener: func, index:index}))
                    if(index>-1){
                        this._listeners.splice(index, 1);
                        $EventHandler.trigger("removeListener:post", s, {setting: settingProxy, listener: func, index:index});
                    }
            }
        }
        addChildrenListener(func){
            if(typeof func == "function"){
                var settingProxy = getCategoryProxy(this);
                if($EventHandler.trigger("addChildrenListener:pre", s, {setting: settingProxy, listener: func})){
                    if(!this._listeners) this._listeners = [];
                    if(!this._listeners.childrenListeners) this._listeners.childrenListeners = [];
                    this._listeners.childrenListeners.push(func);            
                    
                    $EventHandler.trigger("addChildrenListener:post", s, {setting: settingProxy, listener: func});
                }
            }
        }
        removeChildrenListener(func){
            if(this._listeners && this._listeners.childrenListeners){
                var settingProxy = getCategoryProxy(this);
                var index = this._listeners.childrenListeners.indexOf(func);
                if($EventHandler.trigger("removeChildrenListener:pre", s, {setting: settingProxy, listener: func, index:index}))
                    if(index>-1){
                        this._listeners.childrenListeners.splice(index, 1);
                        $EventHandler.trigger("removeChildrenListener:post", s, {setting: settingProxy, listener: func, index:index});
                    }
            }
        }
        addPropertyListener(func){
            if(typeof func == "function"){
                var settingProxy = getCategoryProxy(this);
                if($EventHandler.trigger("addPropertyListener:pre", s, {setting: settingProxy, listener: func})){
                    if(!this._listeners) this._listeners = [];
                    if(!this._listeners.propertyListeners) this._listeners.propertyListeners = [];
                    this._listeners.propertyListeners.push(func);            
                    
                    $EventHandler.trigger("addPropertyListener:post", s, {setting: settingProxy, listener: func});
                }
            }
        }
        removePropertyListener(func){
            if(this._listeners && this._listeners.propertyListeners){
                var settingProxy = getCategoryProxy(this);
                var index = this._listeners.propertyListeners.indexOf(func);
                if($EventHandler.trigger("removePropertyListener:pre", s, {setting: settingProxy, listener: func, index:index}))
                    if(index>-1){
                        this._listeners.propertyListeners.splice(index, 1);
                        $EventHandler.trigger("removePropertyListener:post", s, {setting: settingProxy, listener: func, index:index});
                    }
            }
        }
        
        //util functions
        getChildrenObject(settingsOnly, categoriesOnly){
            var obj = {};
            var keys = Object.keys(this);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = this[key];
                if(key[0]!="_" && key!="value" && val && 
                        (!settingsOnly || val.value!==undefined) && (!categoriesOnly || val._hasChildren))
                    obj[key] = val;
            }
            
            return obj;
        }
        getChildrenList(settingsOnly, categoriesOnly){
            return Object.values(this.getChildrenObject(settingsOnly, categoriesOnly));
        }
        
        list(obj){
            if(!obj) obj = {};
            if(this.value!==undefined)
                obj[this.getPath()] = this;
            
            var keys = Object.keys(this);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                if(key[0]!="_"){                
                    var val = this[key];
                    if(val && val.list){
                        val.list(obj);
                    }
                }
            }
            return obj;
        }
        getAvailableSettings(){
            var out = "";
            
            var list = this.list();
            var keys = Object.keys(list);
            
            var l = 0;
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                l = Math.max(key.length, l);
            }
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = list[key];
                
                var n = "current value";
                out += key+ " ".repeat(l-key.length)+" "+n+": "+val.value+"\n"; 
                if(val._description)
                    out += " ".repeat(l)+" description"+" ".repeat(n.length-"description".length)+": "+val._description+"\n";
                if(val._type)
                    out += " ".repeat(l)+" value type"+" ".repeat(n.length-"value type".length)+": "+val._type+"\n";
                if(val._regex)
                    out += " ".repeat(l)+" value regex"+" ".repeat(n.length-"value regex".length)+": "+val._regex+"\n";
            }
            return out;
        }
        getPath(from$Settings){            
            var path = this._name;
            if(this._parent){
                if(!from$Settings || this._parent._parent)
                    path = this._parent.getPath(from$Settings)+"."+path;
            }
            return path;
        }
        
        //saving functions
        getValues(){
            var obj = {};
            if(this.value!==undefined)
                obj.value = this.value; 
            
            var keys = Object.keys(this);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = this[key];
                if(key[0]!="_"){        
                    if(val instanceof Category)
                        obj[key] = val.getValues();
                }
            }
            return obj;
        }
        setValues(obj){
            var settingProxy = getCategoryProxy(this);
            if($EventHandler.trigger("setValues:pre", s, {setting:settingProxy, values:obj})){
                var keys = Object.keys(obj);
                
                if(obj.value){
                    this.value = obj.value;
                    keys.splice(keys.indexOf("value"),1);
                }
                
                for(var i=0; i<keys.length; i++){
                    var key = keys[i];
                    var val = obj[key];
                    settingProxy[key].setValues(val);
                }
                $EventHandler.trigger("setValues:post", s, {setting:settingProxy, values:obj});
            }
        }
        toString(){
            return this.getString();
        }
        getString(){
            return JSON.stringify(this.getValues(), null, 4).replace(/\n/g, '\r\n');
        }
        setString(str){
            var settingProxy = getCategoryProxy(this);
            if($EventHandler.trigger("setString:pre", s, {setting:settingProxy, string:str})){            
                this.setValues(JSON.parse(str));
                $EventHandler.trigger("setString:post", s, {setting:settingProxy, string:str});
            }
        }
    }
    
    
    //variable validation functions
    var isValueValid = function(setting, value, oldValue, isPreSetCheck){
        if(setting._validations){
            var validationTypesNames = Object.keys(validationTypes);
            //go through all validation names
            for(var i=0; i<validationTypesNames.length; i++){
                var type = validationTypesNames[i];
                var validationData = setting._validations[type];
                //check if validation data exists in the setting
                if(validationData){                
                    var validation = validationTypes[type];
                    //check if the validation type corresponds with the settings type, 
                    //if this is not the case 2 validations have been defined that require different settings types
                    if(validation.type && setting._validations.type && validation.type!=setting._validations.type.value){
                        console.error(setting, "You can't define multiple validations that operate on different value types");
                    }else{                
                        var val = validation.func(validationData.value, value, setting);
                        //execute the validation, return an object with data  if the validation was unsuccessful
                        if($EventHandler.trigger("validateValue:pre", s, {setting:setting, 
                                                                        value:value, 
                                                                        validationType:type, 
                                                                        validationReturn:val,
                                                                        isPreSetCheck: !!isPreSetCheck,
                                                                        currentValue:oldValue}) && val){
                            return {success:false, message:validationData.errorMessage||val, validationType:validation};
                        }    
                    }
                }
            }
        }
        return {success:true};
    }
    
    //proxy to automatically create sub categories, fire event listeners on value change, and synchronize changes between browser windows
    const createProxy = function(obj){
        const proxy = new Proxy(obj, {
            set: function(target, property, value, receiver){
                if(typeof property != "symbol"){
                    if(property=="value"){                   //when changing the value, send value to all listeners
//                        console.log(value, new Error());
                        var resp = target.setValue(value);
                        if(resp && !resp.success){
                            console.error(resp.message);
                        }
                        return true;
                    }else if(property[0]=="_"){              //straight up define any variables that start with a _
                        var valueCopy;
                        if(value instanceof Object && property!="_listeners" && property!="_defaultValue"){ 
                            //create a proxy if the value is an object, so it also forwards its changes
                            if(!(value instanceof Function) && !(value instanceof RegExp)){
                                value = createObjectProxy(property, target, value, proxy);
                                valueCopy = $Utils.copy(value);
                            }else
                                valueCopy = value;
                        }else{
                            valueCopy = value
                        }
                        if(!externalChange && property!="_listeners"){
                            if(property=="_GUIclass" || property=="_settingHelpMessage"){
                                value = $CommunicationUtils.encodeClassData(value, ["*","load.*"]);
                                sendHost("propertyChange", {path:target.getPath(true), property:property, value:value});
                                value = $CommunicationUtils.decodeClassData(value); //converts script paths into the return value of the script
                            }else
                                sendHost("propertyChange", {path:target.getPath(true), property:property, value:$CommunicationUtils.encodeClassData(valueCopy)});
                        }
                        target[property] = value;
    
                        //send property change to all listeners    
                        if(target._listeners && target._listeners.propertyListeners){
                            for(var i=0; i<target._listeners.propertyListeners.length; i++){
                                var f = target._listeners.propertyListeners[i];
                                f.call(proxy, property, target[property], true);
                            }
                        }                                    
                    }else if(target[property] instanceof Category || 
                            target[property]===undefined){//define the default value of an option, together with its description
                        
                        if(target[property]===undefined)
                            target.addChildSetting(property);
                            
                        if(value instanceof Object){
                            
                            //add all the parameters
                            var keys = Object.keys(value);
                            for(var i=0; i<keys.length; i++){
                                var key = keys[i];
//                                if(key!="validations"){                                
                                    var val = value[key];
                                    target[property]["_"+key] = val;
//                                }
                            }                            
                            $EventHandler.trigger("setup:post", s, {setting: target[property]});
                        }else{
                            target[property].value = value;                        
                        }
                    }
//                    externalChange = false;
                }else{
                    target[property] = value;
                }
                return true;
            },
            get: function(target, property, receiver){
                if(typeof property != "symbol"){
                    if(property=="value" || target[property]!==undefined){//if we are trying to access a defined variable or the value, straight up return it
                        return target[property];
                    }else if(property[0]!="_"){                //make sure we are not trying to access a private property;
                        return target.addChildSetting(property);
                    }
                }else{
                    return target[property];
                }
            },
            deleteProperty: function(target, property){
                if(typeof property != "symbol"){
                    if(property!="value" && property[0]!="_"){                    
                        var parent = target[property]._parent; //(_parent should be equal to target)
                        if(!externalChange)
                            sendHost("categoryDelete", {path:target[property].getPath(true)});
                        
                        //send category removal to all listeners    
                        if(parent._listeners && parent._listeners.childrenListeners){
                            for(var i=0; i<parent._listeners.childrenListeners.length; i++){
                                var f = parent._listeners.childrenListeners[i];
                                var obj =categoryProxies.find(function(n){return n[0]==parent}); 
                                f.call(obj?obj[1]:null, "delete", target[property], property);
                            }
                        }
                        
                        //remove object from target and from categoryProxies
                        var index = null;
                        for(var i in categoryProxies){
                            if(categoryProxies[i]==target[property])
                                index = i;
                        }
                        if(index)
                            categoryProxies.splice(index, 1);
                        delete target[property];
                        
                        //also delete chain of parents if it doesn't contain any value or children
                        while(parent && parent._parent){
                            var keys = Object.keys(parent);
                            var removeParent = true;
                            var hasChildren = false;
                            for(var i=0; i<keys.length; i++){
                                var key = keys[i];
                                if(key[0]!="_"){
                                    removeParent = false;
                                    if(key[0]!="value")
                                        hasChildren = true;
                                }
                            }
                            if(!hasChildren)
                                parent._hasChildren = false;
                            if(removeParent){
                                delete parent._parent[parent._name];
                                parent = parent._parent;
                            }else{
                                break;
                            }
                        }
                        
                        $EventHandler.trigger("deleteSetting:post", s, {setting: target[property]});
                    }
//                    externalChange = false;
                }else{
                    delete target[property];
                }
                return true;
            }
        });
        return proxy;
    }
    const createCategory = function(name, parent){        
        var cat = new Category();
        cat._name = name;
        cat._hasChildren = false;
        if(parent){
            cat._parent = parent;
            parent._hasChildren = true;
        }
        
        var proxy = createProxy(cat);
        //add propertylistener, which will set the value to the default value if needed
        var thisCausingChange = false;
        const checkValidationType = function(key, obj){
            if(key[0]!="_"){
                var val = obj._validations[key];
                
                //make sure it is an object containing a value
                if(val.value===undefined) obj._validations[key] = {value:val};
                
                //set the type if that is required by the validation
                if(validationTypes[key]){
                    var type = validationTypes[key].type;
                    if(type)
                        obj._validations.type = {value:type};
                }
                
            }
        }
        proxy.addPropertyListener(function(property){
            var split = property.split(".");
            if(!thisCausingChange){
                //make sure the _validations object has the correct format
                if(split.shift()=="_validations"){
                    thisCausingChange = true //prevent recursion
                    
                    var t = this;
                    var obj =categoryProxies.find(function(n){return n[1]==t}); 
                    if(obj){
                        obj = obj[0];
                    
                        if(split.length==0){ //check validations
                            var keys = Object.keys(obj._validations);
                            for(var i=0; i<keys.length; i++){
                                var key = keys[i];
                                checkValidationType(key, obj);
                            }
                        }else if(split.length==1){ //check validation
                            var key = split[0];
                            checkValidationType(key, obj);
                        }
                    }
                    
                    
                    thisCausingChange = false;
                }
                
                if(property=="_defaultValue" || property.split(".").shift()=="_validations"){
//                    console.log(this._name, this._defaultValue, this.value);
                    //validate old value, if invalid, set value to defaultValue; 
                    //don't check if the changes were external, the window that created the changes will update the value
                    if(!externalChange && this._defaultValue!==undefined){
                        if(this.value===undefined || !isValueValid(this, this.value).success){
                            this.value = this._defaultValue;
                            $EventHandler.trigger("setToDefaultValue:post", s, {setting: this, value:this.value, defaultValue:this._defaultValue});
                        }
                    }
                }
            }
        });

        categoryProxies.push([cat,proxy]);
        return proxy;
    }
    
    const createObjectProxy = function(name, parent, obj, setting){
//        console.log(obj, Proxy);
//        if(obj instanceof Proxy)
//            return null;
//        TODO prevent proxies being created around proxies
        const getPath = function(obj){
            var path = obj._name;
            var p = obj._parent;
            while(p && p._parent){
                path = p._name+"."+path;
                p = p._parent;
            }
            return path;
        };
                
        //scan object for child objects
        var keys = Object.keys(obj);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var val = obj[key];
            if(val instanceof Object && !(val instanceof Function) && !(val instanceof RegExp)){
                obj[key] = createObjectProxy(key, obj, val, setting);
            }
        }

        //set name and parent, to easily get the path of the object
        obj._parent = parent;
        obj._name = name;
        
        //create a proxy that forwards any changes
        var proxy = new Proxy(obj, {
            set: function(target, property, value, receiver){
                if(typeof property != "symbol"){    //symbols can't be forwarded
                    var valueCopy;
                    if(value instanceof Object && property!="_listeners"){        //create a proxy if the value is an object, so it also forwards its changes
                        if(!(value instanceof Function) && !(value instanceof RegExp)){
                            value = createObjectProxy(property, target, value, proxy);
                            valueCopy = $Utils.copy(value);
                        }else
                            valueCopy = value;
                    }else{
                        valueCopy = value
                    }
                    if(!externalChange){
                        sendHost("propertyChange", {path:getPath(target), 
                                                    property:property, 
                                                    value:$CommunicationUtils.encodeClassData(valueCopy, "load.*")});
                    }
                    target[property] = value;
    
                    //send property change to all listeners    
                    if(setting._listeners && setting._listeners.propertyListeners){
                        for(var i=0; i<setting._listeners.propertyListeners.length; i++){
                            var f = setting._listeners.propertyListeners[i];
                            f.call(setting, (getPath(target)+"."+property).substr(setting.getPath(true).length+1), value, false);
                        }
                    }                
                }else{
                    target[property] = value;
                }
            }
        });
        return proxy;
    }
    
    //saving and loading
    class $Settings extends Category{    
        constructor(){
            super();
            this._name = "$Settings";
        }
        save(){
            if($EventHandler.trigger("save:pre", s, {})){
                var dirname = require("path").dirname(path);
                
                if(!fs.existsSync(dirname)){
                    fs.mkdir(dirname);
                }
                console.log(this.getString());
                fs.writeFile(path, this.getString(), function(error) {
                    if(error){
                        console.error("Settings weren't able to be saved: ", error);
                    }else{
                        console.info("Settings saved succesfully");
                    }
                    
                    var d = {success:!error};
                    if(error) d.errorMessage = error;
                    $EventHandler.trigger("save:post", s, d);
                });                
            }
        }
        load(){
            if($EventHandler.trigger("load:pre", s, {})){
                var error;
                try {
                    var data = fs.readFileSync(path, 'utf8');
                    
                    this.setString(data);
                    console.info("Settings loaded succesfully");
                }catch(e){
                    error = e;
                    console.error("Settings weren't able to load: ", e);
                }
                    
                var d = {success:!error};
                if(error) d.errorMessage = error;
                $EventHandler.trigger("load:post", s, d);
            }
        }
        fromString(path){
            return getObject(path);
        }
    }
    var sBase = new $Settings();
    var s = createProxy(sBase);
    categoryProxies.push([sBase,s]); 
    
    //load the settings
    settingsChange(null, ipc.sendSync("settingChange", {type:"getSettings"}));
    return s;
});