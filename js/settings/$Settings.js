loadOnce("Setting");
loadOnce("/$Utils");
//load $CommuncationUtils at end of file, as the intilisation of that requires Setting to be defined
(function(){ 
    /* Settings format        all the properties are optional
     * 
     * defaultValue:                              (the default value of the setting, if it hasn't been altered)
     * validation: {                              (the value validation for when someone attempts to alter it)
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
     * settingIndex: Integer                      (A number to indicate the ordering of the settings in the settings GUI)
     * settingAbove: "SettingName"                (The name of the setting that this setting should appear below in the GUI) 
     * settingInvisible: Boolean                  (If this element should be added to the settings GUI)
     * settingDisabled: Boolean                   (If this setting is disabled, and should not be alterable, but still visible in the GUI)
     * settingSpacing: Boolean | Number           (If this setting is set to true, there will be some space between this setting and the next setting)
     * settingDisplayName: "name"                 (The name that should be displayed for this setting in the GUI)
     * settingVisibilityCheck: {
     *         settings: ["settingPath1","2"],
     *         func: function(settingVal1, val2)
     *     }                                      (A function to update a settings visibility based on other setting values)
     * settingHelpMessage: "description" | 
     *                         { 
     *                             html: ``,
     *                             style: ``
     *                         } |
     *                         HTMLElement class  (A description what this setting is used for)
     * 
     * categoryIndex: integer                     (A number to indicate the ordering of the category in the navigation GUI)
     * categoryAbove: "SettingName"               (The name of the category that this setting should appear below in the GUI)
     * categoryInvisible: Boolean                 (If this element should be added to the navigation GUI)
     * categoryDisplayName: "name"                (The name that should be displayed for this category in the GUI)
     * categoryPushSettings: Boolean              (child settings will be added to settings area, when this category is added, instead of just when the category is selected)
     * 
     * properties with # are not fully implemented, and might be buggy, they will be fully implemented when the Settings are being refactored
     * settingVisibilityCheck doesn't live update for instance
     * 
     * TODO:
     * categoryDescription: "description"|htmlTemplate    (A description what this category is used for)
     * update Category.list() to show all relevant properties 
     * make settings easily navigateable with keyboard
     */
    
    const nameKey = Setting.getSymbol("name");
    const proxyKey = Setting.getSymbol("proxy");
    const externalChangeIndicator = Setting.getSymbol("externalChange");
    
    const ipc = require('electron').ipcRenderer;
    const fs = require("fs");
    const path = $Utils.fixPath($Utils.dataPath()+"Settings.txt");
    
    var settingWindows = [];
    const ignoreGroups = [];
    var currentGroup = null;
    var batchGroup = null;
    var dontSendUpdates = false;
    
    //extend the setting object
    window.$Settings = Setting.createSettingProxy(new (class $Settings extends Setting{ //create proxy around a modefied version of Setting
        constructor(){
            super("$Settings");
        }
        
        //file saving methods
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
        
        __sendUpdate(data){
            if(!dontSendUpdates){                
                data.group = {group:currentGroup, batchGroup:batchGroup};
//            console.log(data)
                ipc.send("settingChange", data);
            }
        }
        registerIgnoreGroup(groupName){
            ignoreGroups.push(groupName);
        }
        setGroup(CurrentGroup, BatchGroup){
            var oldGroup = currentGroup;
            var oldBatchGroup = batchGroup;
            currentGroup = CurrentGroup;
            batchGroup = BatchGroup
            ipc.send("settingChange", {type:"changeGroup", data:{group: currentGroup, 
                                                                 batchGroup: batchGroup,
                                                                 oldGroup: oldGroup,
                                                                 oldBatchGroup: batchGroup}});
        }
        setDontSendUpdate(val){
            dontSendUpdate = val;
        }
        
        //window methods
        openWindow(newWindow){
            if(newWindow || settingWindows.length==0){
                var controller = new SettingsWindowController();
                controller.__onClose = function(){
                    var index = settingWindows.indexOf(controller);
                    if(index!=-1)
                        settingWindows.splice(index, 1);
                };
                settingWindows.push(controller);
            }else{
                var controller = settingWindows[settingWindows.length-1];
                controller.window.show();
            }
        }
        closeWindow(index){
            if(index){
                var controller = settingWindows[index];
                if(controller){
                    controller.close();
                    settingWindows.splice(index, 1);
                }
            }else{
                for(var i=0; i<settingWindows.length; i++)
                    settingWindows[i].close();
                settingWindows = [];
            }
        }
    })("$Settings"));
    
    //listen for any settings changes from another window
    const settingsChange = function(event, data){
        if(!data.group || ignoreGroups.indexOf(data.group.group)==-1){ //make sure the group the setting change was sent from, is not within the ignore groups
            
            var setting;
            //target setting and indicate that the following changes are external and should not be forwarded or canceled
            const targetSetting = function(path){
                setting = $Settings.getSettingFromPath(path);
                setting.__setExternalChange(true);
            }
            
            //apply forwarded changes
            if(data.type=="createSetting"){        
                //get parent setting and get the created setting's name
                var pathNodes = data.data.path.split(".");
                var lastNode = pathNodes.pop();
                targetSetting(pathNodes.join("."));
                
                //create setting
                if(data.data.copiedSetting){
                    var copiedSetting = $Settings.getSettingFromPath(data.data.copiedSetting);
                    setting.createChildSettingCopy(lastNode, copiedSetting);
                }else
                    setting.createChildSetting(lastNode);
            }else if(data.type=="createObject"){
                //target setting that contains the syncedObject
                targetSetting(data.data.settingPath);
                
                //get parent object and the created object's name
                var objectPath = data.data.objectPath.split(".");
                var objectName = objectPath.pop();
                var object = setting.getProperty(objectPath.join("."));
                
                //create object
                object.createChildObject(objectName);
            }else if(data.type=="deleteSetting"){
                //target and delete setting
                targetSetting(data.data.path);
                setting.delete();
            }else if(data.type=="deleteObject"){
                //target setting that contains the syncedObject
                targetSetting(data.data.settingPath);
                
                //get the syncedObject and delete it
                var object = setting.getProperty(data.data.objectPath);
                object.delete(objectName);
            }else if(data.type=="changeValue"){
                //get setting and change its value
                targetSetting(data.data.path);            
                var val = $CommunicationUtils.decodeClassData(data.data.value); 
                var args = $CommunicationUtils.decodeClassData(data.data.args);
                setting.setValue.apply(setting, [val].concat(args));
            }else if(data.type=="changeProperty"){
                //get setting, or setting that contains the targeted syncedObject
                if(data.data.settingPath)   targetSetting(data.data.settingPath);
                else                        targetSetting(data.data.path);
                
                //get targeted syncedObject if needed
                if(data.data.objectPath)    var object = setting.getProperty(data.data.objectPath);
                
                //set property of setting or syncedObject
                (object||setting).setProperty(data.data.property, $CommunicationUtils.decodeClassData(data.data.value));
            }else if(data.type=="deleteProperty"){
              //get setting, or setting that contains the targeted syncedObject
                if(data.data.settingPath)   targetSetting(data.data.settingPath);
                else                        targetSetting(data.data.path);
                
                //get targeted syncedObject if needed
                if(data.data.objectPath)    var object = setting.getProperty(data.data.objectPath);
                
                //delete property of setting or syncedObject
                (object||setting).deleteProperty(data.data.property);
            }else if(data.type=="getSettings"){
                //indicate that the following changes are external and shouldn't be forwarded, and load the data
                targetSetting("");
                $Settings.setData($CommunicationUtils.decodeClassData(data.data));
                if(Object.keys(data.data).length==0){
                    setting.__setExternalChange(false);
                    $Settings.load(); //only load the settings from file on initial setup
                }
            }
            
            //set external change to false, so any following changes will be forwared to other windows again
            if(setting)
                setting.__setExternalChange(false);
        }
    }
    
    //setup settings listener
    ipc.on("settingChange", settingsChange);
    
    //request setting data(synchronously)
    settingsChange(null, ipc.sendSync("settingChange", {type:"getSettings"}));
})();
loadOnce("/communication/$CommunicationUtils");