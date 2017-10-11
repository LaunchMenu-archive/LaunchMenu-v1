window.$EventHandler = (function(){
    var eh = {
        eventsList: [],//set to [] to generate an event list, set null to ignore
        logEvents: null,//log events in the console value can be false, "name", "full" or "short" and ":pre" or ":post" can be added
        get eventsListString(){
            return getTypesString([eh.eventsList]);
        },
    };
    
    var listeners = {};
    eh.addListener = function(type, func){
        type = type.split(":");
        if(type.length>2)
            throw Error("Invalid type");
        if(!listeners[type[0]])
            listeners[type[0]] = {pre:{start:[], def:[], end:[]}, post:{start:[], def:[], end:[]}};
            
        if(type[1]=="pre")
            listeners[type[0]].pre.def.push(func);
        else
            listeners[type[0]].post.def.push(func);
    };
    eh.addListenerEnd = function(type, func){
        type = type.split(":");
        if(type.length>2)
            throw Error("Invalid type");
        if(!listeners[type[0]])
            listeners[type[0]] = {pre:{start:[], def:[], end:[]}, post:{start:[], def:[], end:[]}};
            
        if(type[1]=="pre")
            listeners[type[0]].pre.end.push(func);
        else
            listeners[type[0]].post.end.push(func);
    };
    eh.addListenerStart = function(type, func){
        type = type.split(":");
        if(type.length>2)
            throw Error("Invalid type");
        if(!listeners[type[0]])
            listeners[type[0]] = {pre:{start:[], def:[], end:[]}, post:{start:[], def:[], end:[]}};
        
        if(type[1]=="pre")
            listeners[type[0]].pre.start.push(func);
        else
            listeners[type[0]].post.start.push(func);
    };
    eh.removeListener = function(func){
        var keys = Object.keys(listeners);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var t = listeners[key];
            for(var j=0; j<2; j++){
                for(var n=0; n<3; n++){
                    var ar = t[j==0?"pre":"post"][["start","def","end"][n]];
                    var index = ar.indexOf(func);
                    if(index!=-1)
                        ar.splice(index, 1);
                }
            }
        }
    };
    
    var eventsSuppressed = false;
    var timeout = 0;
    eh.disableEvents = function(){
        eventsSuppressed = true;  
        clearTimeout(timeout);
        timeout = setTimeout(function(){ //always stop events from being disabled in the next cycle (for if someone forgot to enable them again)
            eventsSuppressed = false;
        });
    };
    eh.enableEvents = function(){
        eventsSuppressed = false;  
    };

    //functions for creating a list of all events
    var getTypes = function(obj, first){
        var maxLength = 8;
        if(obj instanceof Array){
            if(obj.length>maxLength){
                return ["Array with many items"];
            }else{
                var typeAr = [];
                for(var i=0; i<obj.length; i++){
                    typeAr.push(getTypes(obj[i]));
                }
                return [typeAr];
            }
        }else if(obj instanceof Object && obj!=null){
            var keys = Object.keys(obj);
            if(obj.constructor.name!="Object" || (keys.length>maxLength && !first)){
                return [obj.constructor.name||"Object"];
            }else{
                var typeObj = {};
                for(var i=0; i<keys.length; i++){
                    var key = keys[i];
                    var val = obj[key];
                    
                    typeObj[key] = getTypes(val);
                }
                return [typeObj];
            }
        }else{
            return [obj==null?"null":typeof obj];
        }
    };
    var combineTypes = function(typeObj1, typeObj2){
        var val2 = typeObj2[0];
        outer:{
            //check if the value matches a value in the array
            for(var i=0; i<typeObj1.length; i++){
                var val1 = typeObj1[i];
                if(val1 instanceof Array){
                    if(val2 instanceof Array){
                        if(val1.length == val2.length){
                            for(var j=0; j<val1.length; j++){
                                val1.splice(j,1, combineTypes(val1[j], val2[j]));
                            }
                            break outer;
                        }
                    }
                }else if(val1 instanceof Object){
                    if(val2 instanceof Object){
                        var keys1 = Object.keys(val1);    
                        var keys2 = Object.keys(val2);
                        if(keys1.length == keys2.length){
                            same:{
                                for(var j=0; j<keys1.length; j++){
                                    if(keys1[j]!=keys2[j])
                                        break same;
                                }
    
                                for(var j=0; j<keys1.length; j++){
                                    var key = keys1[j];
                                    val1[key] = combineTypes(val1[key], val2[key]);
                                }
                                break outer;
                            }
                        }
                    }
                }else{
                    if(val1 == val2)
                        break outer;
                }
            }
    
            //add new alternative
            typeObj1.push(typeObj2[0]);
        }
        return typeObj1;
    };
    var getTypesString = function(types){
        var tab = "    ";
        var typesOptions = types.sort(function(a,b){
            if(a=="null" && b!="null"){
                return 1
            }else if(a!="null" && b=="null"){    
                return -1
            }else if(typeof a == "string" && typeof b == "string"){
                return a>b;
            }else if(typeof a == "string"){
                return 1;
            }else if(typeof b == "string"){
                return -1;
            }else{
                return 0;
            }
        });
        var out = "";
        for(var i=0; i<typesOptions.length; i++){
            types = typesOptions[i];
            if(i>0)
                out += "||";
            if(types instanceof Array){
                out += "[\n";
                for(var j=0; j<types.length; j++){
                    var val = getTypesString(types[j]);
                    out += tab+val.replace(/(\r\n?|\n)/g, "$1"+tab)+",\n";
                }
                out += "]";
            }else if(types instanceof Object){
                var keys = Object.keys(types);
                out += "{\n";
                
                var maxKeyLength = 0;
                for(var j=0; j<keys.length; j++){
                    if(keys[j].length>maxKeyLength)
                        maxKeyLength = keys[j].length;
                }
                var spacer = " ".repeat(maxKeyLength+1);
                
                for(var j=0; j<keys.length; j++){
                    var key = keys[j];
                    var val = getTypesString(types[key]);
                    var tabVal = val.replace(/(\r\n?|\n)/g, "$1"+tab);
                    if(tabVal==val){
                        out += tab+key+":"+spacer.substring(key.length)+val+",\n";
                    }else{
                        out += tab+key+":"+tabVal+",\n";
                    }
                }
                out += "}";
            }else{
                out += types;
            }
        }
        return out;
    }

    //the main trigger function that is called by classes
    eh.trigger = function(type, caller, data){
        if(!eventsSuppressed){
            // developer/debug stuff
            {
                var typeName = type;
                if(caller.constructor.name!="Object") typeName = caller.constructor.name+"."+type;
                
                if(eh.logEvents){
                    var logEventsParts = eh.logEvents.split(":");
                    if(logEventsParts.length==1 || logEventsParts[1]==type.split(":")[1])
                        if(logEventsParts[0] == "full"){
                            console.log(typeName, caller, data);
                        }else if(logEventsParts[0] == "short"){
                            console.log(typeName, data);
                        }else if(logEventsParts[0] == "name"){
                            console.log(typeName);
                        }   
                }    
                if(eh.eventsList!=null){
                    var classes = [];
                    var n = caller;
                    while(n.__proto__.constructor.name!="Object"){
                        classes.push(n.__proto__.constructor.name);
                        n = n.__proto__;
                    }
                    for(var i=0; i<classes.length; i++){
                        var c = classes[i];
                        var typeName = c+"."+type;
                        try{
                            if(!eh.eventsList[typeName]){
                                eh.eventsList[typeName] = getTypes(data);
                            }else{
                                eh.eventsList[typeName] = combineTypes(eh.eventsList[typeName], getTypes(data));
                            }
                        }catch(e){}
                    }
                    if(classes.length==0){
                        try{
                            if(!eh.eventsList[type]){
                                eh.eventsList[type] = getTypes(data);
                            }else{
                                eh.eventsList[type] = combineTypes(eh.eventsList[type], getTypes(data));
                            }
                        }catch(e){}
                    }
                }
            }
            
            
            type = type.split(":");
            if(type.length>2)
                throw Error("Invalid type");
            
            var event = {caller:caller, canceled:false, stopPropagation:false};
            var orderTypes = ["start", "def", "end"];
            
            //retrieve the names of the listeners to target
            var listenerNames = ["*"]; //always trigger for the * listener
            if(caller.constructor.name != "Object"){ //caller of the event is of a custom class
                var n = caller;
                while(n.__proto__.constructor.name!="Object"){ //loop through all super classes
                    listenerNames.push(n.__proto__.constructor.name+"."+type[0]);
                    listenerNames.push(n.__proto__.constructor.name+".*"); //also trigger the event for the class.* listener
                    n = n.__proto__;
                }
                event.name = caller.constructor.name+"."+type[0]+":"+type[1];
            }else{
                listenerNames.push(type[0]);
                event.name = type[0]+":"+type[1];
            }
            
            //loop through all listeners and fire the events
            listenerIterator:
            for(var n=0; n<listenerNames.length; n++){
                var ln = listenerNames[n];
                
                var l = listeners[ln];
                
                if(l){
                    if(type[1]=="pre")  l = l.pre;
                    else                l = l.post;
                    
                    for(var i=0; i<orderTypes.length; i++){
                        var t = l[orderTypes[i]];
                        
                        for(var j=0; j<t.length; j++){
                            t[j](data, event);
                            if(event.stopPropagation)
                                break listenerIterator;
                        }
                    }
                }
            }
            
            return !event.canceled;
        }
        return true;
    };
    
    return eh;
})();