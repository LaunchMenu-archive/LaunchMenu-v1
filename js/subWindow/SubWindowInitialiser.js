/*global variables Utils, $, ResizeSensor*/
(function(){
    var BrowserWindow;
    var ipc;
    try{
    	BrowserWindow = require('electron').remote.BrowserWindow;
    	ipc = require('electron').ipcRenderer;
    }catch(e){}
    
    console.log(window);
    	
    var getFunction = function(str){
        var funcContent = str.match(/function\s*\(\)\s*{((\n|.)*)}/);
        if(funcContent)
            return Function(funcContent[1]);
        else
            return function(){
                throw Error("function content not found using regex: /function\\s*\\(\\)\\s*{((\\n|.)*)}\nfunction string:/"+str);
            }
    };
    var parseArrayFunctions = function(array){
        for(var i=0; i<array.length; i++){
            var val = array[i];
            if(val instanceof Object){
                if(Object.keys(val).length==1 && val["function"]){
                    array[i] = getFunction(val["function"]);
                }else{
                    parseObjectFunctions(val);
                }
            }else if(val instanceof Array){
                parseArrayFunctions(val);
            }
        }
    };
    var parseObjectFunctions = function(object){
        if(object!=null){
            var keys = Object.keys(object);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var val = object[key];
                if(val instanceof Object){
                    if(Object.keys(val).length==1 && val["function"]){
                        object[key] = getFunction(val["function"]);
                    }else{
                        parseObjectFunctions(val);
                    }
                }else if(val instanceof Array){
                    parseArrayFunctions(val);
                }
            }
        }
    };
    
    var con = window.controller;
    parseObjectFunctions(con);
    
    
    var n = Utils.createTemplateElement(con.className, con.template);
    con.element = n.element;
    con.$ = n.querier;
    con.htmlClassName = n.htmlClassName;
    if(window.webTest){
        $("body").append(con.element);
        
        con.listeners = [];
        con.on = function(type, listener){
            var l = con.listeners[type];
            if(!l){
                con.listeners[type] = listener;
            }else{
                if(l instanceof Function){
                    con.listeners[type] = [];
                    con.listeners[type][type] = l;
                    l = con.listeners[type];
                }
                l.push(listener);
            }
        };
        con.send = function(event, data){
            
        };
    }else{
        $("body").append(con.element);
        
        con.on = function(){
            ipc.on.apply(ipc, arguments);  
        };
        
        var parent = BrowserWindow.fromId(con.parentWindowID);
        var thisID = con.windowID;
        window.on = con.on;
        con.send = function(event, data){
            parent.send("subWindowEvent", {id:thisID, event:event, data:data});
        };
        window.send = con.send;
        
        if(con.listeners){
            var keys = Object.keys(con.listeners);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var listener = con.listeners[key];
                window.on(key, listener);
            }
        }
        
        var rsl = new ResizeSensor(con.element, function(){
            con.send("resize", {width: n.element.width(), height: n.element.height()});
        });
        $(function(){
            con.send("resize", {width: n.element.width(), height: n.element.height()});
        });
        
        if(con.onInit)
            con.onInit.call(con);
    }
    
   
})();