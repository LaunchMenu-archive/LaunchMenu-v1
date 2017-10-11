/*global $*/
loadOnce("/libraries/jQuery")
window.$Utils = (function(){
    var u = {};
    
    u.regexEscape = function(str){
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    var lmRoot = $("._lm_._QUERYNODE_");
    u.lm = function(selector){
        var q = $(selector);
        if(q.prevObject){
            return $(selector).filter(function(){
                return $(this).closest("._QUERYNODE_")[0]==lmRoot[0];
            });
        }else
            return q;    
    };
    
    u.fitImageInDiv = function(imgEl, container, imageData, padding, callback){
        var maxWidth = container.width()-padding*2;
        var maxHeight = container.height()-padding*2;
        var maxRatio = maxHeight/maxWidth;
        
        var img = new Image();
        img.src = imageData;
        img.onload = function(){
            var width = img.width;
            var height = img.height;
            
            var ratio = height/width;
            
            if(ratio>maxRatio){
                height = maxHeight;
                width = height/ratio;
            }else{
                width = maxWidth;
                height = width*ratio;
            }
            imgEl.width(width).height(height);    
            imgEl.attr("src", imageData);
            if(callback)
                callback(img.width, img.height, width, height);
        };
    }
    u.setCursor = function(type){
        var el = $("body");
        if($Window && $Window.content) el = $Window.content.parent();
        if(type){
            el.css("cursor", type);
        }else{
            el.css("cursor", "auto");
        }
    }
    
    const colors = {"aliceblue":"#F0F8FF", "antiquewhite":"#FAEBD7", "aqua":"#00FFFF", "aquamarine":"#7FFFD4", "azure":"#F0FFFF", "beige":"#F5F5DC", 
            "bisque":"#FFE4C4", "black":"#000000", "blanchedalmond":"#FFEBCD", "blue":"#0000FF", "blueviolet":"#8A2BE2", "brown":"#A52A2A", 
            "burlywood":"#DEB887", "cadetblue":"#5F9EA0", "chartreuse":"#7FFF00", "chocolate":"#D2691E", "coral":"#FF7F50", "cornflowerblue":"#6495ED", 
            "cornsilk":"#FFF8DC", "crimson":"#DC143C", "cyan":"#00FFFF", "darkblue":"#00008B", "darkcyan":"#008B8B", "darkgoldenrod":"#B8860B", 
            "darkgray":"#A9A9A9", "darkgrey":"#A9A9A9", "darkgreen":"#006400", "darkkhaki":"#BDB76B", "darkmagenta":"#8B008B", "darkolivegreen":"#556B2F", 
            "darkorange":"#FF8C00", "darkorchid":"#9932CC", "darkred":"#8B0000", "darksalmon":"#E9967A", "darkseagreen":"#8FBC8F", "darkslateblue":"#483D8B", 
            "darkslategray":"#2F4F4F", "darkslategrey":"#2F4F4F", "darkturquoise":"#00CED1", "darkviolet":"#9400D3", "deeppink":"#FF1493", 
            "deepskyblue":"#00BFFF", "dimgray":"#696969", "dimgrey":"#696969", "dodgerblue":"#1E90FF", "firebrick":"#B22222", "floralwhite":"#FFFAF0", 
            "forestgreen":"#228B22", "fuchsia":"#FF00FF", "gainsboro":"#DCDCDC", "ghostwhite":"#F8F8FF", "gold":"#FFD700", "goldenrod":"#DAA520", 
            "gray":"#808080", "grey":"#808080", "green":"#008000", "greenyellow":"#ADFF2F", "honeydew":"#F0FFF0", "hotpink":"#FF69B4", "indianred":"#CD5C5C", 
            "indigo":"#4B0082", "ivory":"#FFFFF0", "khaki":"#F0E68C", "lavender":"#E6E6FA", "lavenderblush":"#FFF0F5", "lawngreen":"#7CFC00", 
            "lemonchiffon":"#FFFACD", "lightblue":"#ADD8E6", "lightcoral":"#F08080", "lightcyan":"#E0FFFF", "lightgoldenrodyellow":"#FAFAD2", 
            "lightgray":"#D3D3D3", "lightgrey":"#D3D3D3", "lightgreen":"#90EE90", "lightpink":"#FFB6C1", "lightsalmon":"#FFA07A", "lightseagreen":"#20B2AA", 
            "lightskyblue":"#87CEFA", "lightslategray":"#778899", "lightslategrey":"#778899", "lightsteelblue":"#B0C4DE", "lightyellow":"#FFFFE0", 
            "lime":"#00FF00", "limegreen":"#32CD32", "linen":"#FAF0E6", "magenta":"#FF00FF", "maroon":"#800000", "mediumaquamarine":"#66CDAA", 
            "mediumblue":"#0000CD", "mediumorchid":"#BA55D3", "mediumpurple":"#9370DB", "mediumseagreen":"#3CB371", "mediumslateblue":"#7B68EE", 
            "mediumspringgreen":"#00FA9A", "mediumturquoise":"#48D1CC", "mediumvioletred":"#C71585", "midnightblue":"#191970", "mintcream":"#F5FFFA", 
            "mistyrose":"#FFE4E1", "moccasin":"#FFE4B5", "navajowhite":"#FFDEAD", "navy":"#000080", "oldlace":"#FDF5E6", "olive":"#808000", "olivedrab":"#6B8E23", 
            "orange":"#FFA500", "orangered":"#FF4500", "orchid":"#DA70D6", "palegoldenrod":"#EEE8AA", "palegreen":"#98FB98", "paleturquoise":"#AFEEEE", 
            "palevioletred":"#DB7093", "papayawhip":"#FFEFD5", "peachpuff":"#FFDAB9", "peru":"#CD853F", "pink":"#FFC0CB", "plum":"#DDA0DD", "powderblue":"#B0E0E6", 
            "purple":"#800080", "rebeccapurple":"#663399", "red":"#FF0000", "rosybrown":"#BC8F8F", "royalblue":"#4169E1", "saddlebrown":"#8B4513", "salmon":"#FA8072", 
            "sandybrown":"#F4A460", "seagreen":"#2E8B57", "seashell":"#FFF5EE", "sienna":"#A0522D", "silver":"#C0C0C0", "skyblue":"#87CEEB", "slateblue":"#6A5ACD", 
            "slategray":"#708090", "slategrey":"#708090", "snow":"#FFFAFA", "springgreen":"#00FF7F", "steelblue":"#4682B4", "tan":"#D2B48C", "teal":"#008080", 
            "thistle":"#D8BFD8", "tomato":"#FF6347", "turquoise":"#40E0D0", "violet":"#EE82EE", "wheat":"#F5DEB3", "white":"#FFFFFF", "whitesmoke":"#F5F5F5", 
            "yellow":"#FFFF00"};
    u.getRGBA = function(color){//extract rgb data
        if(color instanceof Array){ //is already formatted correctly
            if(color.length==3)
                color.push(255);
            return color;
        }
            
        if(colors[color.toLowerCase()]) color = colors[color.toLowerCase()]; 
        
        var match = $("<n></n>").css("color",color).css("color").match(/[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9.]*)[^0-9]*/);
        if(!match){
            throw Error(color+" is not a supported color");
        }
        color = [];
        color[0] = Number(match[1]);
        color[1] = Number(match[2]);
        color[2] = Number(match[3]);
        color[3] = Number(match[4])*255||255;
        return color;
    };
    u.getColorPer = function(color1, color2, per){
        var r = Math.sqrt(Math.pow(color2[0],2)*per+Math.pow(color1[0],2)*(1-per));
        var g = Math.sqrt(Math.pow(color2[1],2)*per+Math.pow(color1[1],2)*(1-per));
        var b = Math.sqrt(Math.pow(color2[2],2)*per+Math.pow(color1[2],2)*(1-per));
        var a = Math.sqrt(Math.pow(color2[3],2)*per+Math.pow(color1[3],2)*(1-per));
        if(isNaN(a)) a=255; //if a wasn't present in the color array
        return [Math.round(r), Math.round(g), Math.round(b), Math.round(a)];        
    };
    u.getColorPerLinear = function(color1, color2, per){
        var r = color2[0]*per+color1[0]*(1-per);
        var g = color2[1]*per+color1[1]*(1-per);
        var b = color2[2]*per+color1[2]*(1-per);
        var a = color2[3]*per+color1[3]*(1-per);
        if(isNaN(a)) a=255; //if a wasn't present in the color array
        return [Math.round(r), Math.round(g), Math.round(b), Math.round(a)];        
    };
    u.rgbaToCss = function(rgba){
        return "rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+(
            rgba[3]!=null?
            Math.floor(rgba[3]/255*100)/100
            : 1
        )+")";
    };
    
    //text selection utils
    u.clearTextSelection = function(){
        if(document.selection){
            document.selection.empty();
        }else if(window.getSelection){
            window.getSelection().removeAllRanges();
        }
    };
    u.disableTextSelection = function(val){
        var el = $("body");
        if(window.$Window && $Window.content) el = $Window.content.parent();
        
        if(val){            
            el.css("user-select","none");
            $("[contenteditable=true]").attr("contentwaseditable",true).attr("contenteditable",false);
        }else{
            el.css("user-select","auto");
            $("[contentwaseditable=true]").attr("contenteditable",true).attr("contentwaseditable","");            
        }        
    }
    
    //path utils
    const fs = require("fs");
    const Path = require("path");
    u.dataPath = function(){
        if(process.env.LMAppData)
            return u.fixPath(process.env.LMAppData);
        if(process.env.APPDATA)
            return u.fixPath(process.env.APPDATA+"\\LaunchMenu\\");
        return u.fixPath(process.env.HOME+"\\Library\\Application Support\\LaunchMenu\\");
    };
    u.rootPath = function(){
        return process.cwd();
    };
    u.fixPath = function(path){
        return path.replace(/\\/g,"/").replace(/\/\//g, "/");
    };
    u.mkDirp = function(path){
        path = u.fixPath(path);
        var dirs = path.split("/");
        
        if(dirs[dirs.length-1].match(/\./)) //remove last dir, if not a dir but file
            dirs.pop();
        
        var fullPath = dirs.shift();
        for(var dir of dirs){
            fullPath += "/"+dir;
            if(!fs.existsSync(fullPath)){
                fs.mkdirSync(fullPath);
            }
        }
    }
    
    //template utils
    u.createQueryNode = function(element){
        var root = element;
        root.addClass("_QUERYNODE_");
        var func = function(selector){
            try{ //might throw an error if selector contains & which is not a valid css selector symbl
                
                return root.find(selector).filter(function(){ //make sure the root of the elements found are the same as the created element
                    return $(this).parents("._QUERYNODE_")[0]==root[0];
                });
                
            }catch(e){
                //execute search with a & in there
                if(selector.indexOf("&")!=-1){
                    var parts = selector.split("&");
                    var el = null;
                    var newEl = null;
                    for(var i=0; i<parts.length; i++){ //query each part
                        var part = parts[i];
                        if(!el){ //find child element
                            if(newEl) newEl.add(func(part));
                            else      newEl = func(part);
                        }else{ //find sub child element
                            el.each(function(){
                                if(this.$)
                                    if(newEl) newEl.add(this.$(part));
                                    else      newEl = this.$(part);
                            });
                        }
                        el = newEl;
                        newEl = null;
                    }
                    return el;
                }else
                    throw e;
            }
            
//            //check if the jquery call was even a query
//            if(q.prevObject){
//                console.log(root, selector);
//            }else
//                return q;
        };
        return func;
    };
    u.createTemplateElement= function(name, template, UID){ //use tempElement&childTempElement to target an element in a child
        if(UID==true)
            UID = Math.floor(Math.random()*Math.pow(10, 8));
        var c = "_"+name.replace("$","0")+"_"+(UID?" _"+UID+"_":"");
        var el = $("<div class='"+c+"'>"+template.html+"</div>");


        //create query function, that will only find elements that are a child of this element, and not of a child element
        var query = u.createQueryNode(el);
        
        var rootUID;
        
        //regex to find all selectors, and add the class to the selector so it only applies to this element
        var selector = /([^,+~&{}:]+)((:[^,+~{}:]+)*)([,+~&]|\{([^\{\}]+)\})/g;
        //create a unique styling if a UID is provided, only add the style once otherwise
        const addStylingClass = function(){
            var qn = null;
            return template.style.replace(selector, function(match, g1, g2, g3, g4){
                var cn = c;
                if(qn && qn.htmlClassName)
                    cn = qn.htmlClassName;
                if(g4=="&"){
                    if(qn==null)    qn = query(g1)[0];
                    else               qn = qn.$(g1)[0];
                    
                    return g1+"."+cn+" ";
                }else{
                    qn = null;
                    return g1+"."+cn+g2+g4;
                }
            });
        }
        if(UID){
            var styling = addStylingClass();
            styling = styling.replace(/\.root([^,+~{}:a-zA-Z])/,".root$1");
            el.append("<style>"+styling+"</style>");
        }else{
            var existingStyle = $("body").children("style."+c);
            if(existingStyle.length==0){
                rootUID = Math.floor(Math.random()*Math.pow(10,7)); //add a UID to the rootselector, as any child template element will otherwise copy this root styling
                
                //add class to styling
                var styling = addStylingClass();
                styling = styling.replace(/\.root([^,+~{}:a-zA-Z])/,".root"+rootUID+"$1");
                
                style = $("<style class="+c+">"+styling+"</style>");
                style[0].rootUID = rootUID; //save rootUID for when another element uses this styling
                $("body").append(style);
            }else{
                rootUID = existingStyle[0].rootUID; //get earlier saved rootUID 
            }
        }
        el.addClass("root"+rootUID);
        
        
        //add the class so the css style applies to all child elements
        //use query so any child template elements wont copy the styling
        query("*").add(el).addClass(c);
        
        return {element:el, querier:query, htmlClassName:c};
    };
    
    //keyboard utils
//    u.keyboardEventToShortcut = function(keyEvent, allowModifiersAsKeys){
//        var specialKeys = {ctrlKey:"ctrl", shiftKey:"shift", altKey:"alt"};
//        var keyNames = Object.keys(specialKeys);
//        
//        if(!allowModifiersAsKeys && ["control","shift","alt"].indexOf(keyEvent.key.toLowerCase())!=-1)
//            return false;
//        
//        var output = "";
//        for(var i=0; i<keyNames.length; i++){
//            var name = keyNames[i];
//            if(keyEvent[name]) 
//                output+=specialKeys[name]+"+";
//        }
//        
//        output+=keyEvent.key.toLowerCase();
//        return output;
//    };
//    u.testShorcut = function(keyEvent, shortcuts){
//        s:
//        for(var shortcut of shortcuts.split(",")){ //go through shortcuts            
//            shortcut = shortcut.toLowerCase();
//            var specialKeys = {ctrlKey:"ctrl", shiftKey:"shift", altKey:"alt"};
//            var keyNames = Object.keys(specialKeys);
//            
//            //search if all the special keys are pressed
//            for(var i=0; i<keyNames.length; i++){
//                var name = keyNames[i];
//                var index = shortcut.indexOf(specialKeys[name]);
//                if(!!keyEvent[name] != (index!=-1)) 
//                    break s;
//            }
//            
//            //check if the right key is pressed
//            var parts = shortcut.split("+");
//            if(parts.indexOf(keyEvent.key)==-1) break s;
//            
//            return true;
//        }
//        return false;
//    };

    //function/array utils
    u.copy = function(object){
        if(object instanceof Array){
            return jQuery.extend([], object);
        }else{
            return jQuery.extend({}, object);
        }
    }
    u.iterate = function(list, itemFunction, completeFunction, cycleFunction, maxTime){
        if(!maxTime) maxTime = 50;
        
        var i = 0;
        var timeoutID;
        var func = function(){
            var startTime = Date.now();
            outer:{
                inner:{
                    while(i<list.length){
                        if(Date.now()-startTime>maxTime) 
                            break inner;
                        var item = list[i++];
                        itemFunction.call(item, item);
                    }      
                    
                    if(cycleFunction)
                        cycleFunction();
                    if(completeFunction)
                        completeFunction();
                    break outer;
                }
                
                if(cycleFunction)
                    cycleFunction();
                timeoutID = setTimeout(func,0);
            }
        };
        func();
        
        return function(){
            clearTimeout(timeoutID);
        };
    };
    
    return u;
})();


// function regexEscape(str){
//     return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
// }
// var lmRoot = $("._lm_._QUERYNODE_");
// // var lmRoot = $("._lm_._QUERYNODE_");
// function lm(selector){
//     var q = $(selector);
//     if(q.selector){
//         return $(selector).filter(function(){
//             return $(this).closest("._QUERYNODE_")[0]==lmRoot[0];
//         });
//     }else
//         return q;
// }
// function fitImageInDiv(imgEl, imageData, padding){
//     var oldWidth = imgEl.width();
//     var oldHeight = imgEl.height();
    
//     imgEl.width("100%").height("100%");
//     var maxWidth = imgEl.width()-padding*2;
//     var maxHeight = imgEl.height()-padding*2;
//     var maxRatio = maxHeight/maxWidth;
//     imgEl.width(oldWidth).height(oldHeight);
    
//     var img = new Image();
//     img.src = imageData;
//     img.onload = function(){
//         var width = img.width;
//         var height = img.height;
        
//         imgEl.attr("src", imageData);
//         var ratio = height/width;
        
//         if(ratio>maxRatio){
//             height = maxHeight;
//             width = height/ratio;
//         }else{
//             width = maxWidth;
//             height = width*ratio;
//         }
//         imgEl.width(width).height(height);    
//     };
// }

// function createQueryNode(name, element){
//     var root = element;
//     return function(selector){
//         var q = $(selector);
//         if(q.selector){
//             return root.find(selector).filter(function(){
//                 return $(this).parents("._QUERYNODE_")[0]==root[0];
//             });
//         }else
//             return q;
//     };
// }
// function createTemplateElement(name, template, UID){
//     var c = "_"+name+"_"+(UID?" _"+UID+"_":"");
//     var el = $("<div class='"+c+" _QUERYNODE_'>"+template.html+"</div>");
//     el.find("*").addBack().addClass(c);
    
//     var selector = /([^,+~{}:]+)((:[^,+~{}:]+)*)([,+~]|\{([^\{\}]+)\})/g;
//     if(UID){
//         var styling = template.style.replace(selector, `$1.${c.replace(/ /g,".")}$2$4`);
//         el.append("<style>"+styling+"</style>");
//     }else{
//         if($("body").children("style."+c).length==0){
//             var styling = template.style.replace(selector, `$1.${c}$2$4`);
//             $("body").append("<style class="+c+">"+styling+"</style>");
//         }
//     }
//     el.addClass("root");
    
//     var query = createQueryNode(name, el);
//     return {element:el, querier:query, htmlClassName:c};
// }

// function resetCall(resetFunc, delay){
//     var id = setTimeout(function(){
//         id = null;
//         resetFunc();
//     }, delay);
//     return {cancel:function(){clearTimeout(id)}};
// }

// function keyboardEventToShortcut(keyEvent){
//     var specialKeys = {ctrlKey:"ctrl", shiftKey:"shift", altKey:"alt"};
//     var keyNames = Object.keys(specialKeys);
    
//     var output = "";
//     for(var i=0; i<keyNames.length; i++){
//         var name = keyNames[i];
//         if(keyEvent[name]) 
//             output+=specialKeys[name]+"+";
//     }
    
//     output+=keyEvent.key.toLowerCase();
//     return output;
// }

// function testShorcut(keyEvent, shortcut){
//     shortcut = shortcut.toLowerCase();
//     var specialKeys = {ctrlKey:"ctrl", shiftKey:"shift", altKey:"alt"};
//     var keyNames = Object.keys(specialKeys);
    
//     //search if all the special keys are pressed
//     for(var i=0; i<keyNames.length; i++){
//         var name = keyNames[i];
//         var index = shortcut.indexOf(specialKeys[name]);
//         if(!!keyEvent[name] != (index!=-1)) 
//             return false;
//     }
    
//     //check if the right key is pressed
//     var parts = shortcut.split("+");
//     if(parts.indexOf(keyEvent.key)==-1) return false;
    
//     return true;
// }

// function copy(object){
//     if(object instanceof Array){
//         return jQuery.extend([], object);
//     }else{
//         return jQuery.extend({}, object);
//     }
// }
// function logableFunc(func, name, help){
//     var match = /^[^\(]*\(([^\{\}]*)\)\{/.exec(func+"");
//     var argNames = match[1].split(/,\s*/);
    
//     func.definition = {name:name, args:[], ret:null, description: null};
//     for(var i=0; i<argNames.length; i++){
//         func.definition.args.push({name:argNames[i]});
//     }
    
//     var style = "color:red, color:purple, color:orange";
//     func.inspect = {
        
//     };
    
//     var setHelp = function(help){
//         if(help instanceof Object){
//             if(help.name)        func.definition.name        = help.name;
//             if(help.args)        func.definition.args        = help.args;
//             if(help.ret)        func.definition.ret         = help.ret;
//             if(help.description)func.definition.description = help.description;
//         }else if(help instanceof Array){
//             if(help.length>0){
//                 var n = help[0].split(" > ");
//                 var args = n[0].split(/ /g);
//                 for(var i=0; i<args.length; i++){
//                     func.definition.args[i].type = args[i];
//                 }
//                 var ret  = n[1].split(" ");
//                 func.definition.ret = {name:ret[0]};
//                 if(ret.length>1){
//                     func.definition.ret.type = ret[1];    
//                 }
//             }
//             if(help.length>1){
//                 func.definition.description = help[1];
//             }
//         }else if(typeof help=="string"){
//             func.inspect = {text:help, style:style};
//             func.definition = null;    
//         }
        
//         if(func.definition){
//             func.inspect = {text:"", style:style};
//             func.inspect.text += "@0"+name+"(";
//             for(var i=0; i<func.inspect.args.length; i++){
//                 var arg = func.inspect.args[i];
//                 if()
//             }
            
//         }
        
//     };
//     if(help==null){
//         return new Proxy(func, {
//             set: function(target, name, value){
//                 if(name=="help"){
//                     setHelp(value);
//                 }else
//                     target[name] = value;
//             }
//         });
//     }else{
//         setHelp(help);
//         return func;
//     }
// }
// (function(log){window.console.log = function(){
//     var args = [].slice.call(arguments);
//     for(var i=0; i<args.length; i++){
//         var arg = args[i];
//         var inspect;
        
//         if(Object.keys(arg).length==2 && arg.text!=null && arg.style!=null)
//             inspect = arg;
//         if(arg instanceof Object && args[i].inspect){
//             if((arg.inspect) instanceof Function){
//                 inspect = arg.inspect();
//             }else
//                 inspect = arg.inspect;
//         }        
//         if(inspect && inspect.style && inspect.text){
//             var styles = [];
//             if(typeof (inspect.style) == "string") 
//                 inspect.style = inspect.style.split(",");
//             var text = inspect.text.replace(/@([0-9]+)([^@]+)/g, function(mTotal, m1, m2){
//                 var st = inspect.style[Number(m1)];
//                 if(!/:/.test(st)) st = "color:"+st;
//                 styles.push(st);
//                 return "%c"+m2;
//             });
            
//             if(styles.length==0){
//                 text = "%c"+text;
//                 styles.push(inspect.style[0]);
//             }
//             styles.unshift(text);
            
//             args.splice(i, 1);
//             if(i==0){
//                 args = args.slice(0,i).concat(styles.concat(args.slice(i)));
//                 i+=styles.length-1;
//             }else{
//                 setTimeout(function(){
//                     console.log.apply(console, styles);    
//                 });
//                 i--;
//             }
//         }
//     }
//     log.apply(window, args);
// }})(console.log);
//
//function dedent(input){
//    var lines = input.split("\n");
//    var min = Infinity;
//    for(var i=1; i<lines.length; i++)
//        min = Math.min(min, lines[i].match(/\s+/)[0].length);
//    for(var i=1; i<lines.length; i++)
//        lines[i] = lines[i].substring(min);
//    return lines.join("\n");
//}

