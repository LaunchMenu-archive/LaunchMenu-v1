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
window.Actions = (function(){
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
                            dateCreated:"Sun May 21 2017 19:04:02 GMT+0200 (Central Europe Daylight Time)",
                            dateModified:"Mon May 22 2017 19:04:02 GMT+0200 (Central Europe Daylight Time)",
                            dateAccessed:"Tue May 23 2017 19:04:02 GMT+0200 (Central Europe Daylight Time)"
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
    
    /**
     * 
     * This function converts calls like this:
     * Actions.file.getData = function(path, callback){};
     * 
     * Into client-server calls like this:
     * if (callback) registerCallback(uid = generateUUID(),callback)
     * _ipc.send('invokeAction',{action: 'file.getData', path: path, uid: uid});
     * 
     */
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
                                    data.args = []; 
                                    for(var i=0; i<argNames.length; i++){
                                        if(i!=callbackIndex)
                                           data.args.push(arguments[i]);
                                    }
                                    _ipc.send('invokeAction', data);
                                };
                            else
                                //target[name] = createFunction( , argNames, path);
                                target[name] = function(){
                                    var data = {action:shortPath};
                                    data.args = []; 
                                    for(var i=0; i<argNames.length; i++){
                                        data.args.push(arguments[i]);
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
    //      $Tree.find("somePath").actions.getSize(function(size){
    //          doCrapWithSize(size);
    //      });
    
    
    /*****************************************************************************************************************/
    /*                                                   WINDOW                                                      */
    /*****************************************************************************************************************/
    
    /**
     * object: Actions
     * def: This function shows the main window. If an ID is passed then the IDth window is shown (_currently unimplemented_).
     * params: ID as integer
     * name: window.show
     */
    Actions.window.show = function(ID){};
    
    /**
     * object: Actions
     * def: This function hides the main window. If an ID is passed then the IDth window is hidden (_currently unimplemented_).
     * params: ID as integer
     * name: window.hide
     */
    Actions.window.hide = function(ID){};
    
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
    
    /**
     * object: Actions
     * def: This function toggles the auto-hide on loss of focus.
     * params: state as boolean
     * name: window.toggleAutoUnfocus
     */
    Actions.window.toggleAutoHide = function(state){};
    
    Actions.window.hide.inspect = {text:"Actions.window.hide = function(ID as integer){} returns null;\nThis function hides the main window. If passed an ID, n, the function will hide the nth window."};
    Actions.window.show.inspect = {text:"Actions.window.show = function(ID as integer){} returns null;\nThis function shows the main window. If passed an ID, n, the function will hide the nth window."};
    Actions.window.getSize.inspect = {text:"Actions.window.getSize = function(){} returns {width,height};\nThis function gets the size of the main window."};
    Actions.window.setSize.inspect = {text:"Actions.window.setSize = function(width as float,height as float){} returns null;\nThis function sets the size of the main window."};
    
    /*****************************************************************************************************************/
    /*                                                     LM                                                        */
    /*****************************************************************************************************************/
    
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
    Actions.lm.writeIniFile = function(ini, callback){};
    
    Actions.lm.readIniFile.inspect  = {text:"Actions.lm.readIniFile  = function(callback as function){} returns ini as object;\nObtain the initialisation object. This allows you to read and modify initialisation properties."}
    Actions.lm.writeIniFile.inspect = {text:"Actions.lm.writeIniFile = function(ini as object){} returns null;\n Write an initialisation object to the initialisation JSON file."}
    
    /*****************************************************************************************************************/
    /*                                                    FILE                                                       */
    /*****************************************************************************************************************/
    
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
     * def: This function returns the binary data of a file as a base 64 string. 
     * params: path as string, callback as function
     * callback: data as string
     * name: file.getData64
     */
    Actions.file.getData64 = function(path, callback){};
   
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
    Actions.file.getFilePreview = function(path, callback){};
    
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
    
    /**
     * object: Actions
     * def: This function selects a file in windows explorer / Finder application.
     * params: file as string
     * name: file.selectFile
     */
     Actions.file.select = function(file){};
     
    /**
     * object: Actions
     * def: This function sends a file to the trash/recycle bin
     * params: file as string
     * name: file.trashFile
     */
    Actions.file.delete = function(file){};
    
    /*****************************************************************************************************************/
    /*                                                 FILE SYSTEM                                                   */
    /*****************************************************************************************************************/
    
    /**
     * object: Actions
     * def: This function executes a file, using the shell.
     * params: path as string, args as array
     * name: fileSystem.getFullFileLists
     */
    Actions.fileSystem.getFullFileLists = function(roots, callback){};
    
    /**
     * object: Actions
     * def: Hook into file events on a given file.
     * params: path as string, callback as function
     * name: fileSystem.registerFileHook
     */
    Actions.fileSystem.registerFileHook = function(path, callback){
        registerCallback(uid = generateUUID(),callback);
        _ipc.send('invokeAction',{action: 'fileSystem.registerFileHook', directory: path});
        return uid;
    };        
    
    /**
     * object: Actions
     * def: This unhooks a previous file hook event
     * params: uid as HookID
     * name: fileSystem.unregisterFileHook
     */
    Actions.fileSystem.unregisterFileHook = function(uid){
        _ipc.send('invokeAction',{action: 'fileSystem.unregisterFileHook', uid: uid});
    };
    
    /**
     * object: Actions
     * def: Determine whether a file exists
     * params: path as string, callback as function
     * name: fileSystem.fileExists
     */
    Actions.fileSystem.fileExists = function(path, callback){};
    
    /*****************************************************************************************************************/
    /*                                                    SYSTEM                                                     */
    /*****************************************************************************************************************/
    
    /**
     * object: Actions
     * def: Gets the current operating system
     * params: callback as function
     * name: system.getOS
     */
    Actions.system.getOS = function(callback){};
    
    /**
     * object: Actions
     * def: Uses the system to beep.
     * name: system.beep
     */
    Actions.system.beep = function(){};
    
    
    /*****************************************************************************************************************/
    /*                                                  AUTOMATION                                                   */
    /*****************************************************************************************************************/
    
    
    // Windows OS
    
    /**
     * object: Actions
     * name: automation.dllcall
     * def: This function calls a Win32 DLL function. See https://autohotkey.com/docs/commands/DllCall.htm for details.
     *      Example - ["MessageBox", "Int", "0", "Str", "Press Yes or No", "Str", "Title of box", "Int", "4"] //Will probably change
     *      Result  - {out: "6", in: { function: "MessageBox", args : [{arg: "0", type: "Int"}, {arg: "Press Yes or No", type: "Str"},{arg: "Title of box", type: "Str"},{arg: "4", type: "Int"}]}}
     * params: args as array, callback as function
     * callback: function(results as object)
     * os: windows
     */
    Actions.automation.dllcall = function(args,callback){};
    
    /**
     * object: Actions
     * name: automation.edge
     * params: csCode as string, args as *, callback as function
     * callback: function(errorFromCS as string, resultsFromCS as *)
     * os: windows
     * def: This function executes C# code given as a string using edge-js.
     * 
     */
    Actions.automation.edge = function(csCode,args,callback){};
    
    /**
     * object: Actions
     * name: automation.cmd
     * def: This function executes cmd commands given as a string.
     * params: dosCode as string, args as array, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: windows
     */
    Actions.automation.cmd = function(dosCode,args,callback){};
    /** DOS does not have functions in the conventional sense that other languages do.
     *  however you can print to stdin and stderr. However DOS does have labels. You can also
     *  pass text to the stdin of other functions. E.G. `DIR /S | MORE` where DIR
     *  is passed as STDIN to function MORE.
     *  To access command line arguments you use %1, %2, %3, etc. To access params beyond
     *  %9 you have to use the shift command. Invoke is still used as the entry point.
     * 
     * General syntax:
     * 
     * :Invoke
     * @ECHO OFF
     * ECHO This text goes to Standard Output
     * ECHO This text goes to Standard Error 1>&2
     * ECHO This text goes to the Console>CON
     * EXIT /b
    */
    
    //ALIAS FOR Actions.automation.cmd
    Actions.automation.batch = function(dosCode,args,callback){};
    
    /**
     * object: Actions
     * name: automation.vbs
     * def: This function executes vbs code given as a string.
     * params: vbsCode as string, args as array, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: windows
     */
    Actions.automation.vbs = function(vbsCode,args,callback){};
    /*
    VBS syntax is odd:
        set cArgs = WScript.Arguments
        'cArgs(0) is arg1
        'cArgs(1) is arg2
        'to print data to console use WScript.StdOut.Write
        'write errors using WScript.StdErr.Write
        'can also read from StdIn, however this is not often used (vbs is single threaded)
        'execute vbs using cscript.exe myScript.vbs arg1 arg2 ...
        
        #if function
        WScript.StdOut.Write Invoke(arg1,arg2,arg3,...)
        #if sub
        Invoke arg1,arg2,arg3,...
        
        or
        
        #if function
        WScript.StdOut.Write Invoke(args)
        #if sub
        Invoke args
    */
    
    /**
     * object: Actions
     * name: automation.powershell
     * def: This function executes powershell code given as a string.
     * params: pscode as string, args as ?, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: windows
     */
    Actions.automation.powershell = function(psCode,args,callback){};
    /*
    Standard edge syntax: [untested]
        function Invoke($arg1) \{ 
            # do stuff
            $arg1 + " is awesome!"
        \}
    */
    
    // MAC OS X
    
    /**
     * object: Actions
     * name: automation.powershell
     * params: cscode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: mac
     * def: This function executes AppleScript code given as a string.
     * Applescript needs to be in the following format\:
     * ```applescript
     * on Invoke {var1,var2}
     *     #Prepare return variable:
     *     set output to ("Var1 is: " & var1 & " and Var2 is: " & var2)
     *     return output
     * end Invoke
     * ```
     * I.E. They have to have an `on run` method, this is the method that will be invoked.
     * If the applescript is desired to return results, make sure to return them before
     * the `end run` statement.
     */
    Actions.automation.applescript = function(ascode,args,callback){};
    Actions._ApplescriptWrapper = function(ascode){
        if(/on Invoke\(.*\)/.exec(ascode)){ 
            var args = /on Invoke\((.*?)\)/.exec(ascode)[1].split(",")
            
            /*global dedent*/
            return dedent(`on run {${args.join(",")}}
                               return Invoke(${args.join(",")})
                           end run
                           
                           {//ascode//}`).replace("{//ascode//}",ascode)
        } else {
            throw new Error('No valid Invoke() function defined.');
        }
    }
    
    
    /**
     * object: Actions
     * name: automation.jxa
     * params: jxaCode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: mac
     * def: This function executes JXA (JavaScript for Automation) code given as a string.
     * JXA needs to be in the following format\:
     * function invoke(var1,var2){
     *    console.log('You can also log to stdout via the console')
     *    return 'Var1 is: ' + var1 + ' and Var2 is: ' + var2
     * }
     */
    Actions.automation.jxa = function(jxaCode,args,callback){};
    Actions._JXAWrapper = function(jxaCode){
        /*
        // Try to catch when __args should be passed as an object rather than as a set of arguments.
        function run(__args){
            var __count = /\((.*?)\)/.exec(Invoke.toString())[1].split(",").length
            if ((__count == 1) & __args.length > 1){
                return Invoke(__args)
            } else {
                return Invoke.apply(this,__args)
            }
        }
        */
        
        return dedent(`
            // Try to catch when __args should be passed as an object rather than as a set of arguments.
            function run(__args){
                var __count = /\\((.*?)\\)/.exec(Invoke.toString())[1].split(",").length
                if ((__count == 1) & __args.length > 1){
                    return Invoke(__args);
                } else {
                    return Invoke.apply(this,__args);
                }
            }\n\n{//jxaCode//}`).replace('{//jxaCode//',jxaCode);
    }
    
    /**
     * object: Actions
     * name: automation.objC
     * params: objcCode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: mac
     * def: This function executes objective-c code given as a string.
     */
    Actions.automation.objC = function(objcCode,args,callback){};
    
    /**
     * object: Actions
     * name: automation.ruby
     * params: rbCode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: mac
     * def: This function executes ruby code given as a string.
     */
    Actions.automation.ruby = function(pyCode, args, callback){};
    
    /**
     * object: Actions
     * name: automation.lisp
     * params: lispCode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: mac
     * def: This function executes lisp code given as a string.
     */
    Actions.automation.lisp = function(pyCode, args, callback){};
    
    /**
     * object: Actions
     * name: automation.python
     * params: jxaCode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: mac
     * def: This function executes python code given as a string.
     */
    Actions.automation.python = function(pyCode, args, callback){};
    
    
    // MAX OS X  |  Linux OS [untested]
    
    /**
     * object: Actions
     * name: automation.bash
     * params: uxCode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: mac, linux
     * def: This function allows Mac and Linux systems the capability of running bash code given as a string.
     * 
     */
    Actions.automation.bash = function(uxCode,args,callback){};
    // RUN WRAPPER ...? - Not experienced here...
    // sh path/to/shell/file.sh
    
    /**
     * object: Actions
     * name: automation.webjs
     * params: jsCode as string, args as *, callback as function
     * callback: function(stderr as string, stdout as string)
     * os: windows, mac, linux
     * def: This function allows users to automate websites using javascript. Think of it as a temporary custom browser. This is available on all operating systems.
     * 
     */
    Actions.automation.webJS = function(jsCode,args,callback){};
    
    
    
    /**
     * object: Actions
     * name: automation.fromFile
     * def: Execute any of the above automation libraries, from file with this function.
     *      Example - Actions.automation.fromFile("edge","path/to/my/code.cs", {aPropertyName: "bob", otherPropertyName: "peanuts"}, function(error,results){ console.log(error,results) });
     * params: action as string, codeFile as string, args as *, callback as function
     * callback: function(*)
     */
    Actions.automation.fromFile = function(action,codeFile,args,callback){};
    
    
    return Actions;
})();




var Language = function(lang){
    this.language=lang;
    this.code="";
};
Language.prototype.fillArgs= function(args,ascode,bracket = "[]",blank="undefined"){   
    var ascodeArgs = ascode.match(/Invoke\((.*)\)/)[1].split(",");
    var argsLengthDelta = args.length-ascodeArgs.length;
    var output = "";
    var argsIndex = 0;
    for(var ascodeArgsIndex=0; ascodeArgsIndex<ascodeArgs.length; ascodeArgsIndex++){
        if(!/\*/.exec(ascodeArgs[ascodeArgsIndex])){
            output += ","+JSON.stringify(args[argsIndex++]);
        }else{
            output += "," + bracket[0];
            for(var i=0; i<argsLengthDelta+1; i++){
                output += JSON.stringify(args[argsIndex++])+",";
            }
            output = output.substring(0,output.length-1)+bracket[1];
        }
    }
    output = output.replace(/".*?[\[\]].*?"|([\[\]])/g, function(match, m1){
        if(!m1) return match;
        else    return bracket["[]".indexOf(m1)];
    });
    return output.substring(1).replace(/undefined/g,blank);
}
Language.prototype.call = function(){
    switch(this.language){
        case "cs":
            break;
        case "batch": //alias for cmd
        case "cmd":
            return dedent(`@echo Off
                               
                           {//code//}`).replace("{//code//}",this.code)
        case "vbs":
            var matches = /(Function|Sub)\s+Invoke\((.*?)\)/i.exec(this.code)
            if(matches[1].toLowerCase()=='function'){
                return dedent(`WScript.StdOut.Write(Invoke(${bashArgs.apply(this,arguments).replace(/ /g, ", ")}))
                               
                               {//code//}`).replace("{//code//}",this.code)
            } else if (matches[1].toLowerCase()=='sub') {
                return dedent(`Invoke ${bashArgs.apply(this,arguments).replace(/ /g, ", ")}
                               
                               {//code//}`).replace("{//code//}",this.code)
            } else {
                throw new Error("The invoke function given is neither a sub or a function.")
            }
        case "powershell":
            //  powershell -command "& {Set-ExecutionPolicy -Scope LocalMachine Unrestricted -Force}"
            //  powershell .\myPS.ps1
            //  Write-Host $(Invoke arg1 arg2 arg3 ...)
            return dedent(`{//code//}
                           
                           Write-Hoset $(Invoke {//args//})
                           `).replace("{//code//}",this.code).replace("{//args//}",bashArgs.apply(this,arguments))
        case "applescript":
            //osacompile -o myAppleScript.txt myAppleScript.scpt
            //osascript myAppleScript.scpt
            return dedent(`on run
                               return Invoke(${this.fillArgs(arguments,this.code,"{}","missing value")})
                           end run
                           
                           {//code//}`).replace("{//code//}",this.code.replace(/(Invoke\(.*)\*/,"$1"))
        case "jxa":
            //osacompile -l JavaScript -o myJXA.txt myJXA.scpt
            //osascript -l JavaScript myJXA.scpt
            return dedent(`function run(){
                               return Invoke(${this.fillArgs(arguments,this.code)})
                           }
                           
                           {//code//}`).replace("{//code//}",this.code.replace(/(Invoke\(.*)\*/,"$1"))
        case "python":
            //python script.py
            return dedent(`{//code//}
                           
                           import sys
                           sys.stdout.write(Invoke(${this.fillArgs(arguments,this.code,"{}","None")}))
                           `).replace("{//code//}",this.code.replace(/(Invoke\(.*)\*/,"$1"))
        case "bash":
            //bash script.sh
            return dedent(`{//code//}
                           
                           Invoke {//args//}
                           `).replace("{//code//}",this.code).replace("{//args//}",bashArgs.apply(this,arguments))
        default:
            throw new Error(this.language + " is not a known language.")
    }
    function bashArgs(){
        var args = [];
        for(var i in arguments){
            var arg = arguments[i]
            if(typeof arg == "object"){
                args.push(JSON.stringify(JSON.stringify(arg)));
            } else {
                args.push(JSON.stringify(arg));
            }
        }
        return args.join(" ")
    }
}

/* VBS Example:
***********************************
lang = new Language("vbs")
lang.code = `
sub Invoke(a,b,c)
    'do stuff
end sub
`
lang.call("a",1,{a:1,b:{a:"A",b:"B"}})

'==> Invoke "a", 1, "{\"a\":1,\"b\":{\"a\":\"A\",\"b\":\"B\"}}"

VBS Example 2:
***********************************
lang = new Language("vbs")
lang.code = `
function Invoke(a,b,c)
    'do stuff
     Invoke = "bob"
end function
`
lang.call("a",1,{a:1,b:{a:"A",b:"B"}})

'==> WScript.StdOut.Write(Invoke("a", 1, "{\"a\":1,\"b\":{\"a\":\"A\",\"b\":\"B\"}}"))
*/

/* Powershell Example
***********************************
var ps = new Language('powershell')
ps.code =`
function Invoke($arg1,$arg2,$arg3){
    return $arg1 + "," + $arg2 + "," + $arg3
}`
ps.call(1,2,3)
# ==> 1,2,3
*/

/* Applescript example:
***********************************
var as = new Language("applescript")
as.code = `
on Invoke(bob,a)
    return bob
end Invoke`
as.call([1,2,3])
# ==> {1,2,3}, missing value
*/

/* JXA example:
***********************************
var as = new Language("jxa")
as.code = `
Invoke(a,b){
    return a + "," + b
}`
as.call([1,2,3])
// ==> 1,2
*/

/* Python example
***********************************
var lang = new Language("python")
lang.code = `
def Invoke(a,b,c):
    return ",".join(map(str,[a,b,c]))`
lang.call("a",1,{a:1,b:{a:"A",b:"B"}})
*/

/* Bash example
***********************************
var lang = new Language("bash")
lang.code = `Invoke(){
    echo $1","$2","$3
}`
lang.call("a",1,{a:1,b:{a:"A",b:"B"}})
# ==> a,1,{"a":1,"b":{"a":"A","b":"B"}}
*/





var bash = function(){
   var args = [];
   for(var i in arguments){
       var arg = arguments[i]
       if(typeof arg == "object"){
           args.push(JSON.stringify(JSON.stringify(arg)));
       } else {
           args.push(JSON.stringify(arg));
       }
   }
   return args.join(" ")
}