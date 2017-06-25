/*global variables Class, Utils, $*/
var SubWindow = (function(){
    var BrowserWindow;
    var fs;
    var path;
    var url;
    var ipc;
    var parentWindowID;
    try{
    	BrowserWindow = require('electron').remote.BrowserWindow;
    	fs = require('fs');
        path = require('path');
		url = require('url');
        ipc = require('electron').ipcRenderer;
        parentWindowID = require('electron').remote.getCurrentWindow().id;
    }catch(e){
        window.webTest = true;
        BrowserWindow = function(){
            
        };
        BrowserWindow.prototype.open = function(html, windowID){
            var head = /<head>((.|\n)*)<\/head>/g.exec(html);
            if(head) head = $(head[1]);
            var body = /<body>((.|\n)*)<\/body>/g.exec(html);
            if(body) body = $(body[1]);
            
            // var win = $("<subWindow></subWindow>");
            // win.append(head);
            // win.append(body);
            // $("body").append(win);
            // this.controller = window.controller;
            
            var iframe = $("<iframe src='../gui/launchmenu.html' id="+windowID+" sandbox='allow-same-origin allow-scripts'></iframe>")
            $("body").append(iframe);
            
            var doc = iframe[0].contentWindow.document;
            var $head = $('head',doc);
            $head.html(head);
            var $body = $('body',doc);
            $body.html(body);
        };
        BrowserWindow.prototype.on = function(){
        };
        BrowserWindow.prototype.once = function(){
            
        };
        BrowserWindow.prototype.setSize = function(width, height){
            
        };
    }
    
    if(!window.webTest)
        ipc.on("subWindowEvent", function(event, data){
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
    
    var subWindow = Class("SubWindow",{
        const: function(windowCode, windowHtml, listeners, onInit, windowFrameHtml){
            windowHtml = windowHtml||this.windowHtml;
            windowCode = windowCode||this.windowCode;
            listeners = listeners||this.listeners;
            windowFrameHtml = windowFrameHtml||this.windowFrameHtml;
            onInit = onInit||this.onInit;
            
            var temp = Utils.copy(windowFrameHtml);
            temp.html = temp.html.replace("_CONTENT_", windowHtml.html);
            temp.style += "\n"+windowHtml.style;
           
           
            windowCode.template = temp;
            windowCode.className = this.className;
            
            var windowID = id++;
            stringifyObjectFunctions(windowCode);
            windowCode = JSON.stringify(windowCode,null,4);
            var subWindowHtml= `
            <html>
                <head>
		            <!--< START SCRIPT IMPORT >-->
            //         <script>if (typeof module === 'object') {window.module = module; module = undefined;}</script>
		          //  <script type="text/javascript" src="../lib/jQuery.js"></script>
		          //  <script type="text/javascript" src="../lib/ResizeSensor.js"></script>
		            
            // 		<!--< END SCRIPT IMPORT >-->
            // 		<script>if (window.module) module = window.module;</script>
            		
            		<style>
            		    html,body{
            		        width:100%;
            		        height:100%;
            		        margin: 0px;
            		    }
            		</style>
		            <link rel="stylesheet" href="../gui/icons.css" type="text/css" />
		            
                </head>
                <body>
                    <script type="text/javascript" src="../js/utilities.js"></script>
                    <script>
                        window.controller = ${windowCode};
                        window.controller.windowID = ${windowID};
                        window.controller.parentWindowID = ${parentWindowID};
                    </script>
                    
                    <script type="text/javascript" src="../js/subWindow/SubWindowInitialiser.js"></script>
                </body>
            </html>`;
            
            this.window = new BrowserWindow(this.windowArgs);
            var t = this;
            subWindows[windowID] = this;
            this.window.on("closed", function(){
                delete subWindows[windowID];
            });
            
            if(!window.webTest){
                fs.writeFile("temp/SubWindowCode.html", subWindowHtml, function(err){
                    if(err){
                        return console.log(err);
                    }
                
                    t.window.loadURL(url.format({
                        pathname: path.join(__dirname, '..', 'temp' ,'SubWindowCode.html'),
                    	   protocol: 'file:',
                        slashes: true
                    }));
                });
            }else{
                this.window.open(subWindowHtml, windowID);
            }
            
            this.window.once('ready-to-show', function(){
                t.window.show();
                if(onInit) onInit();
            });
            
            //window resize;
            this.on("resize", function(event, data){
                console.log(data); 
                this.window.setSize(data.width, data.height);  
            });
            
        },
        on:function(event, listener){
            if(this.listeners[event]){
                this.listeners[event] = [this.listeners[event], listener];
            }else
                this.listeners[event] = listener;
        },
        listeners:{
            
        },
        send:function(){
            if(!this.window.webContents)
                throw Error("You must wait for the window to load");
            this.window.webContents.send.apply(this.window.webContents, arguments);
        },
        windowArgs:{
            title: "",
            frame: false,
            hasShadow: false,
            resizable: false,
            // transparent: true,
            useContentSize: true,
            minimizable: true,
            closeable: true,
            show: false,
        },
        windowCode:{
            
        },
        windowFrameHtml:{
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
        },
        windowHtml:{
            html:   ``,
            style:  ``
        },
    });
    
    if(window.webTest){
        
    }
    return subWindow;
})();