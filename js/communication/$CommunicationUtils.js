loadOnce("/settings/Setting");
window.$CommunicationUtils = (function(){
    var cu = {};
    
    /* Encode Classes, functions, regularExpresions and filepaths into an object, in such a way that it is safe for ipc transfer
     * It also handles recursive objects properly
     * 
     * Use encodeClassData before sending the data over ipc
     * And use decodeClassData after retrieving the data from ipc, to restore any complex data
     * 
     * To allow for filepath encoding, you must use the $ScripLoader.sendFiles method, 
     * and put any objects that depend on those files on the same level.
     * $ScriptLoader.sendFiles will automatically call loadOnce on those paths. 
     * It could look something like this:
     * 
     * var data = $CommunicationUtils.encodeClassData({
     *      load: $ScriptLoader.sendFiles("TestClass","somePath/someFile"),
     *      class: class p extends TestClass{
     *          constructor(){
     *              super();
     *          }
     *      }
     * });
     */
    
    const processing = Symbol("processing");
    const parent = Symbol("processingParent");
    const filesKey = $ScriptLoader.filesSymbol;
    const targetKey = Setting.getSymbol("target");
    const encodeSymbol = Symbol("encode");
    
    const functionRegex = /^function\:\[\{ ((.|\n)*) \}\]$/;
    const regexRegex = /^regex\:\[\{ \/(.*)\/(.*) \}\]$/;
    const strRegex = /^string\:\[\{ ((.|\n)*) \}\]$/;
    const objectRegex = /^object\:\[\{ ([0-9]*):((.|\n)*) \}\]$/;
    const filesRegex = /^files\:\[\{ ((.|\n)*) \}\]$/;
    const customRegex = /^([^:]+)\:\[\{ ((.|\n)*) \}\]$/;
    
    const filesPrefix = "[files]_";
    
    cu.encodeSymbol = encodeSymbol;
    cu.encodeClassData = function(data, key, path){
        if(data && data[targetKey]) data = data[targetKey];
        if(!path) path = "";

        if(data instanceof Object && data[encodeSymbol]){                       //custom objects
            if(data[encodeSymbol] instanceof Function){
                var d = data[encodeSymbol]();
                if(d instanceof Array && d.length==2){
                    var file = d[0];
                    var data = d[1];
                    //jsonify data
                    if(!(data instanceof Array)) data = [data];
                    for(var i=0; i<data.length; i++)
                        data[i] = cu.encodeClassData(data[i]);
                        
                    return file+":[{ "+JSON.stringify(data)+" }]";
                }
            }
        }else if(data instanceof Object && data!=null && data[filesKey]!=null   //encode any files
              //check if it didn't find filesKey in a parent class
                && Object.getOwnPropertySymbols(data).indexOf(filesKey)!=-1){ 
            if(key) key.key = filesPrefix+key.key;
            return "files:[{ "+(data[filesKey].join(","))+" }]";
        }else if(typeof data=="string"){                                        //encode string data
            return "string:[{ "+data+" }]";
        }else if(data instanceof Function){                                     //encode function
            return "function:[{ _="+(data.toString())+" }]";
        }else if(data instanceof RegExp){                                       //encode regular expression
            return "regex:[{ "+(data.toString())+" }]";
        }else if(data instanceof Object && data!=null){                         //convert object, and get rid of recursive structures
            var returnVal = data instanceof Array?[]:{};
            data[processing] = path; //way of handling recursive structures
            
            var keys = Object.keys(data);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                if(!data[key] || data[key][processing]===undefined){
                    var k = {key:key};   //the encode function might alter the key, in order to influence the load order(EG, when encoding files)
                    var val = cu.encodeClassData(data[key], k, path+"."+key);
                    returnVal[k.key] = val; 
                }else                   //handle recursive structures
                    returnVal[key] = "object:[{ "+path.split(".").length+":"+data[key][processing]+" }]";
            }
            
            delete data[processing];
            return returnVal;
        }else{                                                          //return any normal value
            return data;
        }
    };
    
    cu.copy = function(data){
        return cu.decodeClassData(cu.encodeClassData(data));
    };
    cu.decodeClassData = function(data, linkedObj){
        if(typeof data == "string"){
            var m;
            if((m = data.match(strRegex))){
                return m[1];
            }else if((m = data.match(filesRegex))){     //check for files to load
                var files = m[1].split(",");
                return $ScriptLoader.sendFiles(files);
            }else if((m = data.match(functionRegex))){  //check for a function
                try{
                    //load function or class
                    return eval(m[1]);                    
                }catch(e){
                    console.error(e);
                }
            }else if((m = data.match(regexRegex))){     //check for a regular expression
                return new RegExp(m[1], m[2]);
            }else if((m = data.match(objectRegex))){    //handle recursive object
                var obj = linkedObj;
                //get root object
                for(var i=0; i<Number(m[1]); i++)
                    if(obj && obj[parent])
                        obj = obj[parent];
                
                //get object
                for(var part of m[2].split(".")){
                    if(obj!==undefined && part.length>0)
                        obj = obj[part];
                }
                return obj;
            }else if((m = data.match(customRegex))){    //custom objects
                var file = m[1];
                var c = loadOnce(file);
                try{                    
                    var args = cu.decodeClassData(JSON.parse(m[2]));
                    if(c instanceof Function){
                        var params = [c].concat(args);
                        return new (c.bind.apply(c, params));
                    }
                }catch(e){console.error(e)};
            }else{
                return data;
            }
        }else if(data instanceof Object && data!=null){
            var returnVal = linkedObj || (data instanceof Array? []:{});
            data[processing] = true;
            
            //make sure files load first
            var keys = Object.keys(data);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                if(key.length>=filesPrefix.length && key.substring(0,filesPrefix.length)==filesPrefix){
                    keys.splice(0, 0, keys.splice(i,1)[0]);
                }
            }
            
            //load all keys
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                if(data[key] == null || !data[key][processing]){
                    var orKey = key;
                    //remove any file prefixes
                    if(key.length>=filesPrefix.length && key.substring(0,filesPrefix.length)==filesPrefix)
                        key = key.substring(filesPrefix.length);
                        
                    //link an object, so that the object is already defined when an recursive structure tries to retrieve it
                    returnVal[key] = (data[orKey] instanceof Array)?[]:{};
                    returnVal[key][parent] = returnVal; //used for recursive structure retrieval 
                    returnVal[key] = cu.decodeClassData(data[orKey], returnVal[key]);
                    
                    //cleanup
                    if(returnVal[key] && returnVal[key][parent])
                        delete returnVal[key][parent];
                }else
                    returnVal[key] = data[key];
            }
            delete data[processing];
            
            return returnVal;
        }else{
            return data;
        }
    }
    
    return cu;
})();