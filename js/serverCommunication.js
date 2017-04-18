


// function invokeAction(action,data,callback){
//     var ipc = require('electron').ipcRenderer;
//     if(callback) ipc.once('actionReply',callback)
//     ipc.send('windowSetSize',data);
// }

/**
 * Actions Object
 * 
 * This object is specifically designed for sending standard
 * launchmenu commands to with the nodejs server.
 * 
 * This is NOT a general scripting API and is strictly for
 * core implementations.
 * 
 */
function Actions(){(function(){
    var _ipc = require('electron').ipcRenderer;
    
    //Generate GUID
    // from: http://stackoverflow.com/a/8809472/6302131
    /* global performance */
    var generateUUID = function() { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    
    //Define actions API
    var api = {};
    var uid;
    api.windowHide = function(){
        _ipc.send('invokeAction',{action: 'WindowHide'});
    }
    api.settingsShow = function(){
        _ipc.send('invokeAction',{action: 'SettingsShow'});
    }
    api.getWindowSize = function(callback){
        _ipc.once(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetWindowSize', uid: uid});
    }
    api.setWindowSize = function(width,height){
        _ipc.send('invokeAction',{action: 'SetWindowSize', width: width, height: height});
    }
    api.getIconAsync= function (fileIn,fileOut,callback){
        _ipc.once(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetIconAsync', FileIn: fileIn, FileOut: fileOut, uid: uid});
    }
    api.getPreviewDataAsync = function(path,callback){
        _ipc.once(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetPreviewDataAsync', path: path, uid: uid});
    }
    api.getOS = function(callback){
        _ipc.once(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetOS', uid: uid});
    }
    api.executeFile = function(file){
        _ipc.send('invokeAction',{action: 'ExecuteFile', file:file});
    }
    api.readIniFile = function(callback){
        _ipc.once(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetOS', uid:uid});
    }
    api.writeIniFile = function(iniObject){
        //
    }
    return api
})()}

var Actions = new Actions()