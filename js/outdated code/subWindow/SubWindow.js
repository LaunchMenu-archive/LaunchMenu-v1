/*global variables Class, $Utils, $*/
loadOnce("/$Utils");
var SubWindow = (function(){
    var BrowserWindow = require('electron').remote.BrowserWindow;
    var fs = require('fs');
    var path = require('path');
    var url = require('url');
    var ipc = require('electron').ipcRenderer;
    var parentWindowID = require('electron').remote.getCurrentWindow().id;
    
    ipc.on("subWindowEvent", function(event, data){
        console.log("detect", event, data);
        var id = data.id;
        var eventName = data.event;
        data = data.data;
        
        var w =  subWindows[id];
        if(w){
            var listener = w.listeners[eventName];
            if(listener instanceof Function)
                listener.apply(w, [event, data]);
            else if(listener instanceof Array){
                for(var i=0; i<listener.length; i++){
                    listener[i].apply(w, [event, data]);
                }
            }
        }
    });
    
    var id = 0;
    var subWindows = {};

    //functions to write functions to string
    var functionToString = function(func){
        var n = {};
        n["function"] = func.toString();
        return n;
    };
    var stringifyArrayFunctions = function(array){
        for(var i=0; i<array.length; i++){
            var val = array[i];
            if(val instanceof Function){
                array[i] = functionToString(val);
            }else if(val instanceof Object){
                stringifyObjectFunctions(val);
            }else if(val instanceof Array){
                stringifyArrayFunctions(val);
            }
        }
    };
    var stringifyObjectFunctions = function(object){
        if(object!=null){
            var keys = Object.keys(object);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = object[key];
                if(val instanceof Function){
                    object[key] = functionToString(val);
                }else if(val instanceof Object){
                    stringifyObjectFunctions(val);
                }else if(val instanceof Array){
                    stringifyArrayFunctions(val);
                }
            }
        }
    };
    
    window.subWindow = class SubWindow{
        constructor(windowCode, windowHtml, listeners, onInit, windowFrameHtml){
            this.__initVars();
            
            //get data from either the object or the arguments
            windowHtml = windowHtml||this.windowHtml;
            windowCode = windowCode||this.windowCode;
            listeners = listeners||this.listeners;
            windowFrameHtml = windowFrameHtml||this.windowFrameHtml;
            onInit = onInit||this.onInit;
            this.listeners = listeners;
            
            //fill in the html template
            var temp = $Utils.copy(windowFrameHtml);
            temp.html = temp.html.replace("_CONTENT_", windowHtml.html);
            temp.style += "\n"+windowHtml.style;
           
           
            windowCode.template = temp;
            windowCode.className = this.constructor.name;
            
            stringifyObjectFunctions(windowCode); //stringify objects seperately because JSON can't do that
            windowCode = JSON.stringify(windowCode,null,4);
            
            var windowID = id++;
            var subWindowHtml= `
            <html>
                <head>
                    <!--< START SCRIPT IMPORT >-->
                    <script>if (typeof module === 'object') {window.module = module; module = undefined;}</script>
                    
                    <script type="text/javascript" src="../lib/jQuery.js"></script>
                    <script type="text/javascript" src="../lib/ResizeSensor.js"></script>
            
                    <!--< END SCRIPT IMPORT >-->
                    <script>if (window.module) module = window.module;</script>
                
                    <script type="text/javascript" src="../js/$utils.js"></script>
                    <style>
                        html,body{
                            width:100%;
                            height:100%;
                            margin: 0px;
                        }
                        body{
                            overflow: hidden;
                        }
                    </style>
                    <link rel="stylesheet" href="../gui/icons.css" type="text/css" />
                    
                </head>
                <body>
                    <script>
                        window.controller = ${windowCode};
                        window.controller.windowID = ${windowID};
                        window.controller.parentWindowID = ${parentWindowID};
                    </script>
                    
                    <script type="text/javascript" src="../js/subWindow/SubWindowInitialiser.js"></script>
                </body>
            </html>`;
            
            //create browser window
            this.window = new BrowserWindow(this.windowArgs);
            var t = this;
            subWindows[windowID] = this;
            this.window.on("closed", function(){
                delete subWindows[windowID];
            });
            
            //write the actual code to file, in so it can be laoded in the subwindow
            for(var i=0; i<1000; i++){
                var name = "SubWindowCode"+i+".html";
                var exists = fs.existsSync("temp/"+name);
                fs.writeFile("temp/"+name, subWindowHtml, function(err){
                    if(err)
                        return console.error(err);
                    
                    t.window.loadURL(url.format({
                        pathname: path.join(__dirname, '..', 'temp' ,name),
                        protocol: 'file:',
                        slashes: true
                    }));
                });                
            }
            
            //show window once data has loaded
            this.window.once('ready-to-show', function(){
                t.window.show();
                if(onInit) onInit();
            });
            
            //window resize listener and updater
            this.on("resize", function(event, data){
                console.log(data); 
                this.window.setSize(data.width, data.height);  
            });
            
            this.window.webContents.openDevTools();
        }
        __initVars(){
            this.listeners = {};
            this.windowCode = {};
            this.windowArgs = {
                title: "",
                frame: false,
                hasShadow: false,
                resizable: false,
                // transparent: true,
                useContentSize: true,
                minimizable: true,
                closeable: true,
                show: false,
            };
            this.windowFrameHtml = {
                html:   `<div class=body>
                            <div class=header>
                                <div class='windowButton minimize icon icon-minus'></div>
                                <div class='windowButton close icon icon-cross'></div>
                            </div>
                            <div class=content>
                                _CONTENT_
                            </div>
                        </div>`,
                style:  `.body{
                        }
                        .header{
                            min-width: 100px;
                            min-height: 40px;
                        }
                        .windowButton{
                            height: 30px;
                            width: 30px;
                            float: right;
                        }`
            };
            this.windowHtml = {
                html:   ``,
                style:  ``
            };
        }
        
        on(event, listener){
            if(this.listeners[event]){
                this.listeners[event] = [this.listeners[event], listener];
            }else
                this.listeners[event] = listener;
        }
        send(){
            if(!this.window.webContents)
                throw Error("You must wait for the window to load");
            this.window.webContents.send.apply(this.window.webContents, arguments);
        }
    }
    
    if(window.webTest){
        
    }
    return subWindow;
})();