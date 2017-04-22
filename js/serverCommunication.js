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
function Actions(){
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

    /*
     * The following is a callback wrapper.
     * The event caught by ipc.once() calls the callback given to the ipc.once function.
     * Unfortunately the callback requires 2 variables:
     *     callback(emitter,response)
     * This is rather counter intuitive for most functions we use so this wrapper wraps the
     * ipc.once() function to allow the user to create a callback function with a single argument.
     *
     * E.G.
     *      Before:
     *          _ipc.once(uid=generateUUID(),function(emitter,response){
     *              console.log(response)
     *          })
     *      After:
     *          registerCallback(function(response){
     *              console.log(response)
     *          })
     *
     * As shown in the above example, registerCallback makes the function much more convenient.
     */
    function registerCallback(uid,callback){
        function _wrapper(event,results){
            return callback(results)
        }
        return _ipc.once(uid,_wrapper)
    }

    //Define actions API
    var api = {};
    var uid;
    // callback should be of the form:
    // callback(event,data)
    api.windowHide = function(){
        _ipc.send('invokeAction',{action: 'WindowHide'});
    }
    api.settingsShow = function(){
        _ipc.send('invokeAction',{action: 'SettingsShow'});
    }
    api.getWindowSize = function(callback){
        registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetWindowSize', uid: uid});
    }
    api.setWindowSize = function(width,height){
        _ipc.send('invokeAction',{action: 'SetWindowSize', width: width, height: height});
    }
	api.getIconAsync= function (fileIn,fileOut,callback){
		///<summary>Usage: Actions.getIconAsync("C:\\Users\\sancarn\\Desktop\\Client.zip","data\\1icon.png", function(e){console.log(e)})</summary>
        ///<param name="fileIn" type="string">Input Filepath. This parameter may be relative.</param>
		///<param name="fileOut" type="string">Output Filepath. This parameter may be relative.</param>
		///<returns type="Integer/String">Integer: The time taken to extract the icon. String: "Error:" + ErrorMessage</returns>
		registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetIconAsync', FileIn: fileIn, FileOut: fileOut, uid: uid});
    }
    api.dirFileExists = function(path,callback){
        registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'dirFileExists', path: path, uid: uid});
    }
    api.getPreviewDataAsync = function(path,callback){
        registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetPreviewDataAsync', path: path, uid: uid});
		 // returns {default:{data:<hexOutput>,file:<filePath>},lmf:{<otherCrap>}}
    }
    api.getPreviewSizeAsync = function(path,callback){
        registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetPreviewSizeAsync', path: path, uid: uid});
        // returns size (as integer)
    }
    api.getPreviewDateAsync = function(path,callback){
        registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetPreviewDateAsync', path: path, uid: uid});
        // returns dates = {}
    }
    api.getOS = function(callback){
        registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetOS', uid: uid});
    }
    api.executeFile = function(file){
        _ipc.send('invokeAction',{action: 'ExecuteFile', file:file});
    }
    api.readIniFile = function(callback){
        registerCallback(uid = generateUUID(),callback)
        _ipc.send('invokeAction',{action: 'GetOS', uid:uid});
    }
    api.writeIniFile = function(iniObject){
        //
    }
    return api
}

var Actions = new Actions()

