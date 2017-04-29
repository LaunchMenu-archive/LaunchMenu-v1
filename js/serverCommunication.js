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
var Actions = (function(){
    try{
        var _ipc = require('electron').ipcRenderer;
    }catch(e){
        var lastCallback;
        var callbacks = {};
        var _ipc = {
            send:function(func, data){
                // console.log(func, data);
                var action = data.action;
                var uid = data.uid;
                var callback = callbacks[uid];
                if(action.indexOf("getSize")!=-1){
                    setTimeout(function(){callback('event', 20654)},400);
                }else if(action.indexOf("getDates")!=-1){
                    setTimeout(function(){
                        callback('event', {
                            dateCreated:"23-4-2017",
                            dateModified:"24-4-2017",
                            dateAccessed:"25-4-2017"
                        });
                    },100);
                }else if(action.indexOf("getPreview")!=-1){
                    setTimeout(function(){
                        callback('event', {
                            data: "http://www.jqueryscript.net/images/Simplest-Responsive-jQuery-Image-Lightbox-Plugin-simple-lightbox.jpg",
                            file:"/cool/path/yo.png",
                            lmf:{},
                        });
                    },400);
                }else{
                    callback('event', {});    
                }
                delete callbacks[uid];
            }, 
            once:function(id, callback){
                callbacks[id] = callback;
            }
        }; //online testing
    }
    // var _ipc = require('electron').ipcRenderer;

    //Generate GUID
    // from: http://stackoverflow.com/a/8809472/6302131
    /* global performance */
    var generateUUID = function() { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };

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
        var _wrapper = function(event,results){
            return callback(results);
        };
        return _ipc.once(uid,_wrapper);
    }

    //Define actions API
    var Actions = {};
    var uid;
    // callback should be of the form:
    // callback(event,data)
    
    Actions.window = {
        hide: function(id){
            _ipc.send('invokeAction',{action: 'window.hide'});
        },
        show: function(id){
            _ipc.send('invokeAction',{action: 'window.show'});
        },
        getSize: function(callback, id){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'window.getSize', uid: uid});
        },
        setSize: function(width, height, id){
            _ipc.send('invokeAction',{action: 'window.setSize', width: width, height: height});
        }
    };
    
    Actions.lm = {
        settingsShow: function(){
            _ipc.send('invokeAction',{action: 'lm.settingsShow'});
        },
        readIniFile: function(callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'lm.readIniFile', uid:uid});
        },
        writeIniFile: function(iniObject){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'lm.writeIniFile', uid:uid});
        },
    };
    
    Actions.file = {
        getData: function(path,callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'file.getData', path: path, uid: uid});
        },
        getDates: function(path,callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'file.getDates', path: path, uid: uid});
            // returns dates = {DateCreated: rStats.birthtime, DateModified: rStats.mtime, DateAccessed: rStats.atime}
        },
        getSize: function(path,callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'file.getSize', path: path, uid: uid});
            // returns size (as integer)
        },
        getFilePreview: function(path, callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'file.getPreviewImage', path: path, uid: uid});
            // returns pictureData (as base64 string)
        },
    	getIcon32: function (fileIn,callback){
    		registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'file.getIcon32', FileIn: fileIn, uid: uid});
            // returns pictureData (as base64 string) [32x32]
        },
        execute: function(path,args){
            _ipc.send('invokeAction',{action: 'file.execute', path:path, args:args});
        },
    };
    
    Actions.fileSystem = {
        getFullFileLists: function(roots, callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'fileSystem.getFullFileLists', roots:roots, uid: uid});
        },
        registerFileHook: function(directory,callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'fileSystem.registerFileHook', directory: directory});
            return uid;
        },
        unregisterFileHook: function(uid){
            _ipc.send('invokeAction',{action: 'fileSystem.unregisterFileHook', uid: uid});
        },
        fileExists: function(path,callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'fileSystem.fileExists', path: path, uid: uid});
            // returns fileExists (as boolean)
        },
    };
    
    Actions.system = { 
        getOS: function(callback){
            registerCallback(uid = generateUUID(),callback);
            _ipc.send('invokeAction',{action: 'GetOS', uid: uid});
            // returns OS (as string)
        },
    }
    
    
    
    function createFunction(func, argNames, path){
    }
    function createSection(name){
    	return new Proxy({
    	    type:"section",
    	    children: [],
    		getPath:function(){
    			if(this.parent){
    				var p = this.parent.getPath();
    				if(p.length>0) p+=".";
    				return p+this.name;
                }else if(name){
                    return name;
                }
    			return "";
    		},
    		inspect: function(notFirst){
    		    var funcs = [];
		        for(var i=0; i<this.children.length; i++){
    		        var obj = this.children[i];
    		        if(obj.type=="section"){
    		            funcs = funcs.concat(obj.inspect(true));
    		        }else if(obj.coloredDefinition){
    		            funcs.push(obj);
    		        }
    		    }
    		    if(!notFirst){
    		        var ins = new Ins();
    		        var maxLength = 0;
    		        for(var i=0; i<funcs.length; i++){
    		            maxLength = Math.max(maxLength, funcs[i].coloredDefinitionStart().textLength);
    		        }
    		        for(var i=0; i<funcs.length; i++){
    		            ins.add(funcs[i].coloredDefinition(maxLength));
    		            ins.add("\n","color:black");
    		        }
    		        return ins;
    		    }else{
    		        return funcs;
    		    }
    		}
    	}, {
            get: function(target, name){
    			if(!(name in target)){
    				target[name] = createSection();
    				target[name].parent = target;
    				target[name].name = name;
                    target.children.push(target[name]);
                }
    			return target[name];
            },
    		set: function(target, name, value){
    			if(value instanceof Function){ 
    				var match = /^[^\(]*\(([^\{\}]*)\)\{/.exec(value+"");
    				if(match){
    					var argNames = match[1].split(/,\s*/);
                        var callbackIndex = argNames.indexOf("callback");
                        var path = target.getPath()+"."+name;
                        var shortPath = path.split(/[.]/).slice(1).join(".");
                        
                        if(/^[^\(]*\(([^\{\}]*)\)\{\s*\}$/.test(value)){
                            if(callbackIndex>-1)
                                //target[name] = createFunction( , argNames, path);
                                target[name] = function(){
                                    registerCallback(uid = generateUUID(),arguments[callbackIndex]);
                                    
                                    var data = {action:shortPath, uid:uid};
                                    for(var i=0; i<arguments.length; i++){
                                        if(i!=callbackIndex)
                                            data[argNames[i]] = arguments[i];
                                    }
                                    _ipc.send('invokeAction', data);
                                };
                            else
                                //target[name] = createFunction( , argNames, path);
                                target[name] = function(){
                                    var data = {action:shortPath};
                                    for(var i=0; i<arguments.length; i++){
                                        data[argNames[i]] = arguments[i];
                                    }
                                    _ipc.send('invokeAction', data);
                                };
                        }else{
                            target[name] = value;
                            // target[name] = createFunction(value, argNames, path);
                        }
                        target.children.push(target[name]);    
                    }
                }else{
    				target[name] = value;
                }
            }
        });
    }
    
    var Actions = createSection("Actions");
    
    // If you want to use the @ symbil in the comments use \x40
    
    var style = ["black", "font-weight:bold;color:rgb(195,68,65)", "rgb(154,112,180)", "rgb(245,135,31)", "rgb(67,156,162)", "rgb(71,117,176)"];
    //{0:black, 1:class, 2:function, 3:parameters, 4:operators, 5:functionName
    //Example:
    // Actions.window.show.inspect = {text:"@1Actions@0.@2window@0.@5show@4 = @2function@0(@3ID @4as @2integer@0){} @2returns @4null@0;\n@0This function shows the main window. If passed an @3ID@0, @3n@0, the function will show the @3n@0th window. ", style:style};}
    
    // refer to another function with documentation stuffs
    //      ///ref: Actions.file.getSize
    //      tree.find("somePath").actions.getSize(function(size){
    //          doCrapWithSize(size);
    //      });
    
    
    /**
     * object: Actions
     * def: This function hides the main window. If an ID is passed then the IDth window is hidden (_currently unimplemented_).
     * params: ID as integer
     * name: window.hide
     */
    Actions.window.hide = function(ID){};
    
    /**
     * object: Actions
     * def: This function shows the main window. If an ID is passed then the IDth window is shown (_currently unimplemented_).
     * params: ID as integer
     * name: window.show
     */
    Actions.window.show = function(ID){};
    
    /**
     * object: Actions
     * def: This function gets the size of the mainWindow.
     * params: callback as function
     * callback: size as {width:width as float, height:height as float}
     * name: window.getSize
     */
    Actions.window.getSize = function(callback){};
    
    /**
     * object: Actions
     * def: This function sets the size of the mainWindow.
     * params: width as float, height as float
     * name: window.setSize
     */
    Actions.window.setSize = function(width, height){};
    
    Actions.window.hide.inspect = {text:"Actions.window.hide = function(ID as integer){} returns null;\nThis function hides the main window. If passed an ID, n, the function will hide the nth window."};
    Actions.window.show.inspect = {text:"Actions.window.show = function(ID as integer){} returns null;\nThis function shows the main window. If passed an ID, n, the function will hide the nth window."};
    Actions.window.getSize.inspect = {text:"Actions.window.getSize = function(){} returns {width,height};\nThis function gets the size of the main window."};
    Actions.window.setSize.inspect = {text:"Actions.window.setSize = function(width as float,height as float){} returns null;\nThis function sets the size of the main window."};
    
    /**
     * object: Actions
     * def: This function shows the settings menu to the user.
     * name: lm.settingsShow
     */
    Actions.lm.settingsShow = function(){};
    
    /**
     * object: Actions
     * def: This function reads all data from the initialisation file, converts the data to a javascript object, which is returned in the callback. This allows you to read and modify initialisation properties.
     * params: callback as function
     * callback: ini as Object
     * name: lm.readIniFile
     */
    Actions.lm.readIniFile = function(callback){};
    
    /**
     * object: Actions
     * def: This function writes the passed initialisation object to the initialisation file.
     * params: ini as object
     * name: lm.writeIniFile
     */
    Actions.lm.writeIniFile = function(ini){};
    
    Actions.lm.settingsShow.inspect = {text:"Actions.lm.settingsShow = function(){} returns null;\nShows the settings menu to the user."}
    Actions.lm.readIniFile.inspect  = {text:"Actions.lm.readIniFile  = function(callback as function){} returns ini as object;\nObtain the initialisation object. This allows you to read and modify initialisation properties."}
    Actions.lm.writeIniFile.inspect = {text:"Actions.lm.writeIniFile = function(ini as object){} returns null;\n Write an initialisation object to the initialisation JSON file."}
    
    
    
    
    /**
     * object: Actions
     * def: This function returns the binary data of a file as a string. 
     * params: path as string, callback as function
     * callback: data as string
     * name: file.getData
     */
    Actions.file.getData = function(path, callback){};
   
    /**
     * object: Actions
     * def: This function returns various dates related to the passed file path which can be useful for the user.
     * params: path as string, callback as function
     * callback: {dateCreated:dateCreated as Date, dateModified:dateModified as Date, dateAccessed:dateModified as Date}
     * name: file.getDates
     */
    Actions.file.getDates = function(path, callback){};
    
    /**
     * object: Actions
     * def: This function returns the file size of a file. 
     * params: path as string, callback as function
     * callback: size as integer
     * name: file.getSize
     */
    Actions.file.getSize = function(path, callback){}; 
    
    /**
     * object: Actions
     * def: This function uses NodeJS module filepreview to generate a preview of a file as an image. The image is returned as a string of base64 data. 
     * params: path as string, callback as function
     * callback: data as string
     * name: file.getPreview
     */
    Actions.file.getPreview = function(path, callback){};
    
    /**
     * object: Actions
     * def: This function returns the small 32x32 icon of a file. The image is returned as a string of base64 data.
     * params: path as string, callback as function
     * callback: data as string
     * name: file.getIcon32
     */
    Actions.file.getIcon32 = function(fileIn, callback){};
    
    /**
     * object: Actions
     * def: This function executes a file, using the shell.
     * params: path as string, args as array
     * name: file.execute
     */
    Actions.file.execute = function(path, args){};
    
    Actions.fileSystem.getFullFileLists = function(roots, callback){};
    Actions.fileSystem.registerFileHook = function(path, callback){
        registerCallback(uid = generateUUID(),callback);
        _ipc.send('invokeAction',{action: 'fileSystem.registerFileHook', directory: path});
        return uid;
    };        
    Actions.fileSystem.unregisterFileHook = function(uid){
        _ipc.send('invokeAction',{action: 'fileSystem.unregisterFileHook', uid: uid});
    };
    Actions.fileSystem.fileExists = function(path, callback){};
    
    Actions.system.getOS = function(callback){};
    
    // getIcon32: function (fileIn,callback)
    
    // getIcon32.help()
    // fileIn as string, callback as function      returns blabla as string
    // "string{kadkalsd} function --> string"
    
    // getIcon32(fileIn as string, callback as function) returns blablaba as string
    // Description of what the function does
    
    
    return Actions;
})();

