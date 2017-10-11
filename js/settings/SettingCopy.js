loadOnce("Setting");
loadOnce("$Settings");
loadOnce("/communication/$CommunicationUtils");
(function(){    
    const copiedSettingKey = Symbol("copiedSetting");
    const copyTargetKey = Symbol("target");
    const copyingSettingsKey = Symbol("copyingSettings");
    
    const parentKey = Setting.getSymbol("parent");
    const nameKey = Setting.getSymbol("name");
    const targetKey = Setting.getSymbol("target");
    const proxyKey = Setting.getSymbol("proxy");
    const externalChangeIndicator = Setting.getSymbol("externalChange");
    
    const sendDeleteSetting = Setting.getSendHostMethods().deleteSetting;
    
    //settingCopy's object
    window.SettingCopy = class SettingCopy{
        constructor(name, parent, setting){
            if(setting[copiedSettingKey]) setting = setting[copiedSettingKey]; 
            
            this[nameKey] = name;
            this[parentKey] = parent;
            this[copiedSettingKey] = setting
            this[copyTargetKey] = this;
        }
        init(){ //called after proxy is defined
            if(this[copiedSettingKey]){ //there really should always be a setting
                var setting = this[copiedSettingKey];
                var copyingSettings = setting[targetKey][copyingSettingsKey];
                if(!copyingSettings){
                    setting[targetKey][copyingSettingsKey] = [];
                    copyingSettings = setting[targetKey][copyingSettingsKey];
                }
                copyingSettings.push(this[proxyKey]);
            }
        }
        
        //make sure the copied setting isn't deleted
        delete(){
            var isExternal = this[copiedSettingKey][externalChangeIndicator];
            if(isExternal || $EventHandler.trigger("deleteSetting:pre", $Settings, {setting: this[proxyKey]})){
                var parent = this[parentKey][targetKey];
                delete parent[this[nameKey]];
                
                //update parent
                if(parent.getChildrenList().length==0)
                    parent[hasChildrenKey] = false;
                
                //remove itself from copiedSetting
                var copyingSettings = this[copiedSettingKey][copyingSettingsKey];
                var index = copyingSettings.indexOf(this[proxyKey]);
                if(index!=-1)
                    copyingSettings.splice(index, 1);
                
                //sync with other windows settings
                sendDeleteSetting(this[proxyKey]);
                
                //send delete object to all listeners
                parent.__invokeListeners(1, ["delete", this[proxyKey], this[nameKey]]);

                //send general deleteSetting event
                $EventHandler.trigger("deleteSetting:post", $Settings, {setting: this[proxyKey]})
            }
        }
        //get own path instead of the copied setting's path
        getPath(from$Settings){        
            var path = this[nameKey];
            if(this[parentKey]){
                if(!from$Settings || this[parentKey][parentKey])
                    path = this[parentKey].getPath(from$Settings)+"."+path;
            }
            return path;            
        }

        //static methods
        static getSymbol(name){
            if(name=="copiedSetting") return copiedSettingKey;
            if(name=="target") return copyTargetKey;
            if(name=="copyingSettings") return copyingSettingsKey;
        }
        static createSettingCopyProxy(settingCopy){
            return proxy(settingCopy);
        }
        static createProxiedSettingCopy(){
            return this.createSettingCopyProxy(new SettingCopy(...arguments));
        }
    };

    //create proxy to shorten specific methods
    const proxy = function(settingCopy){
        var p = new Proxy(settingCopy, {
            set: function(target, property, value){
                target[copiedSettingKey][property] = value;
                return true;
            },
            get: function(target, property){
                var val = target[property];
                
                if(val instanceof Function)
                    //set function thisArg to target, so this within the function refers to the object directly, not the proxy
                    return val.bind(target);
                
                //if the value couldn't be found, check if the copiedSetting contains the property
                if(val==undefined)
                    val = target[copiedSettingKey][property];
                return val;
            },
            deleteProperty: function(target, property){
                var val = target[property];
                if(val!==undefined)
                    delete target[property];
                else
                    delete target[copiedSettingKey][property];
                return true;
            },
            ownKeys: function(target){
                return Object.keys(target[copiedSettingKey]);
            },
            getOwnPropertyDescriptor(target){
                return {
                    enumerable: true,
                    configurable: true,
                };
            }
        });
        settingCopy[proxyKey] = p;
        settingCopy.init();
        return p;
    }
})();