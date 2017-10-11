window.$ScriptLoader = (function(){
    /*usage:
     *     loadOnce(path);
     * 
     * path can either be a absolute path from the root (by starting the path with /)
     * or a path relative to the location the loadOnce is fire from
    **/
    var s = {};
    
    
    const ipc = require('electron').ipcRenderer
    const htmlRootFolder = "../js/"; //root folder as seen from html
    const jsRootFolder = "js/"; //root folder as seen from js
    const rootFromNode = "js/";
    
    var importScriptStack = []; //an array to detect nested imports and enable for relative paths
    var importedScripts = [];
    var importedScriptsReturnValues = {}; //the data returned from importing a script
    
    var extractHtmlScripts = function(){ //extract the scripts that are loaded on the page
        var scripts = [];
        var scriptElements = document.querySelectorAll('script');
        for(var i=0; i<scriptElements.length; i++){
            var src = scriptElements[i].attributes.src;
            if(src){
                src = src.value;
                if(src.substr(0,htmlRootFolder.length)==htmlRootFolder)
                    src = src.substr(htmlRootFolder.length);
                scripts.push(src);
            }            
        }
        return scripts;
    }
    
    s.setLocation = function(location){
        importScriptStack.push(s.getPath(location));
    }
    s.getPath = function(path, dir){
    
        var startsRoot = path.substr(0,jsRootFolder.length)==jsRootFolder;
        if(path.substring(path.length-3)!=".js" && !dir)
            path+=".js";
        
        
        //alter the path if necessary
        if(path[0]=="/" || startsRoot){
            if(startsRoot){ //cut-off the root dir
                path = path.substr(jsRootFolder.length);
            }else if(path[0]=="/"){
                path = path.substr(1);
            }
        }else{ //the path is relative
            //combine the requested path, with that path that is currently being executed
            var htmlScripts = extractHtmlScripts();
            var lastPath;
            
            if(importScriptStack.length>0){
                lastPath = importScriptStack[importScriptStack.length-1]
            }else{
                lastPath = htmlScripts[htmlScripts.length-1]
            }
            
            //merge the paths
            var cutdownPath = path.replace(/\.\.\//g,"");
            var splitLastPath = lastPath.split("/");
            for(var i=0; i<(path.length-cutdownPath.length)/3+1; i++){
                splitLastPath.pop();
            }
            lastPath = splitLastPath.join("/");
            if(lastPath.length>0) lastPath+="/";
                        
            path = lastPath+cutdownPath;
        }
        return path
    }
    s.showError = function(e, fileName){
        console.warn("error in "+fileName+":");
        if(e instanceof SyntaxError){
            console.error(e);
        }else{
            //here I would console.error() except the linenumber would not be correct
            //so I instead evaluate a piece of code an rename it so that the linenumber and file name match
            window.scriptLoaderErrorObject = e;
            
            var lines = e.stack.split("\n");
            var match;
            for(var i=1; i<lines.length; i++){
                if(match = lines[i].match(/^\s*at .* \((.*):(\d*):(\d*)\)/)){
                    break;
                }
            }
            
            if(match){
                var lineNumber = Number(match[2]);
                
                //create fake 'file' 
                var c = "";
                for(var i=0; i<lineNumber-1; i++){
                    c += "\n";
                }
                c += "console.error(window.scriptLoaderErrorObject);\n";
                c += "//# sourceURL="+match[1];
                
                //eval the error file
                eval(c);            
            }else{
                console.error(error);
            }            
        }
    }
    
    s.getLoadedScripts = function(){
        return importedScripts.concat(extractHtmlScripts());
    }
    s.runCode = function(code, name){
        if(name)
            code += "\n//# sourceURL="+name;
        try{
            eval(code);            
        }catch(e){
            s.showError(e);
            return false;
        }
        return true;
    }
    
    s.getScript = function(path, dontError){
        var inpPath = path;
        //edit path if necessary (when it is relative for instance)
        path = s.getPath(path);
        
        //load the script
        var script = ipc.sendSync("loadScript", {
            rootFromNode:rootFromNode,
            inpPath: inpPath,
            path:path
        });
        script.path = path;
        
        //return code
        if(!script.error){
            return script;
        }else{
            if(!dontError)
                console.error(new Error("Error while loading '"+path+"': "+script.message));
            return null;
        }
    };
    
    var popUntil = function(array, item){
        while(array.pop()!=item && array.length>0){};
    }
    s.loadDir = function(path, subChildren){
        var inpPath = path;
        //edit path if necessary (when it is relative for instance)
        path = s.getPath(path, true);

        var returnVal = [];
        
        //load and execute the script
        var scripts = ipc.sendSync("loadScripts", {
            rootFromNode:rootFromNode,
            inpPath: inpPath,
            path:path,
            loadSubChildren: subChildren
        });
        
        //execute scripts
        if(!scripts.error){
            for(var i=0; i<scripts.length; i++){
                var script = scripts[i]
                
                //check if the returned file hasn't already been loaded
                var p = script.absolutePath.substring(rootFromNode.length).toLowerCase();
                htmlLoaded = extractHtmlScripts().indexOf(p)!=-1;
                imported = importedScripts.indexOf(p)!=-1;
                if(htmlLoaded || imported){
                    returnVal.push(importedScriptsReturnValues[p]);
                    continue;
                }
                
                importScriptStack.push(p);
                importedScripts.push(p);
                var val;
                try{
                    var val = eval(script.code);
                    returnVal.push(val);            
                }catch(e){
                    s.showError(e, p);
                }
                importedScriptsReturnValues[p] = val;
                popUntil(importScriptStack, p);
            }
        }else{
            console.error(new Error("Error while loading '"+path+"': "+scripts.message));
        }
        return returnVal;
    };
    s.loadOnce = function(path, dontError){
        var inpPath = path;
        //edit path if necessary (when it is relative for instance)
        path = s.getPath(path);

        var returnVal = false;
        
        //detect if the script has not already been loaded
        var htmlLoaded = extractHtmlScripts().indexOf(path.toLowerCase())!=-1;
        var imported = importedScripts.indexOf(path.toLowerCase())!=-1;

        if(!htmlLoaded && !imported){
            //load and execute the script
            var script = ipc.sendSync("loadScript", {
                rootFromNode:rootFromNode,
                inpPath: inpPath,
                path:path
            });
            
            //execute code
            if(!script.error){
                //check if the returned file hasn't already been loaded
                var p = script.absolutePath.substring(rootFromNode.length).toLowerCase();
                htmlLoaded = extractHtmlScripts().indexOf(p)!=-1;
                imported = importedScripts.indexOf(p)!=-1;
                if(htmlLoaded || imported)
                    return importedScriptsReturnValues[p];
            
                //store paths and execute code
                importScriptStack.push(p);
                importedScripts.push(p);
                try{
                    returnVal = eval(script.code);
                }catch(e){
                    s.showError(e, path);
                    returnVal = false;
                }
                importedScriptsReturnValues[p] = returnVal;
                popUntil(importScriptStack, p);
            }else if(!dontError){
                console.error(new Error("Error while loading '"+path+"': "+script.message));
            }
        }else{
            returnVal = importedScriptsReturnValues[path.toLowerCase()];
        }
        
        return returnVal;
    };
    s.load = function(path){
        var inpPath = path;
        //edit path if necessary (when it is relative for instance)
        path = s.getPath(path);
        
        
        var returnVal = false;
        //load and execute the script
        var script = ipc.sendSync("loadScript", {
            rootFromNode:rootFromNode,
            inpPath: inpPath,
            path:path
        });
        
        if(!script.error){
            var p = script.absolutePath.substring(rootFromNode.length).toLowerCase();
            
            importScriptStack.push(p);
            importedScripts.push(p);
            try{
                returnVal = eval(script.code);
            }catch(e){
                s.showError(e, path);
                returnVal = false;
            }
            importedScriptsReturnValues[p] = returnVal;
            popUntil(importScriptStack, p);
        }else{
            console.error(new Error("Error while loading '"+path+"': "+script.message));
        }
        
        return returnVal;
    };
    window.loadOnce = s.loadOnce;
    
    //methods to send files
    s.filesSymbol = Symbol("files");
    s.sendFiles = function(files, getFileOutputs){
        if(!(files instanceof Array)) files = $.extend([],arguments);
        
        //load files
        var output = [];
        for(var i=0; i<files.length; i++){
            output.push(s.loadOnce(files[i]));
        }
        
        //make fix the return object if needed
        if(output.length==1) output = output[0];
        if(output==null) output = {};
        
        //create data to send files, this will be converted by $CommunicationUtils
        for(var i=0; i<files.length; i++){            
            var script = s.getScript(files[i]);
            if(script) files[i] = script.absolutePath;
        }
        if(!getFiles) output = {}; //clear output if you don't want to get the file output
        output[s.filesSymbol] = files;
        
        //output the files identifier
        return output;
    }
    
//    s.loadDir("/preview/previewTypes");
//    s.loadDir("previewTypes");
    
    return s;
})();
//# sourceURL=scriptLoader