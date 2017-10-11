/*global variables $Utils, $, ResizeSensor*/
loadOnce("/$Utils");
(function(){
    var BrowserWindow = require('electron').remote.BrowserWindow;
    var ipc = require('electron').ipcRenderer;
    
    //functions to read functions from string
    var getFunction = function(str){
        var funcContent = str.match(/function\s*\((.*)\)\s*{((\s|.)*)}/);
        if(funcContent){
            var args = funcContent[1].split(",");
            return Function(...args, funcContent[2]);
        }else
            return function(){
                throw Error("function content not found using regex: /function\\s*\\(\\)\\s*{((\\n|.)*)}/\nfunction string: "+str);
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
    
    //parse the string to code
    var con = window.controller;
    parseObjectFunctions(con);
    
    //create the elements
    var n = $Utils.createTemplateElement(con.className, con.template);
    con.element = n.element;
    con.$ = n.querier;
    con.htmlClassName = n.htmlClassName;
    
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
            console.log(listener, key)
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
    
   
})();