/*global variables Settings, Utils, tree, Quicksort, File, Directory*/
var Querier = (function(){
    var Querier = {};
    
    Querier.acronymMatch = {
        regex:null,
        prepareRegex:function(query, caseSensitive){
            this.regex = this.getRegex(query, caseSensitive);  
        },
        getRegex:function(query, caseSensitive){
            var parts = query.split(/\./);
            var regex = "^";
            var upperQuery = parts[0].toUpperCase();
            var lowerQuery = parts[0].toLowerCase();
            for(var i=0;i<upperQuery.length;i++){
                var upper = regexEscape(upperQuery[i]);
                var lower = regexEscape(lowerQuery[i]);
                if(i==0){
                    regex += "("+upper+"|"+lower+")([^A-Z]+)";
                }else{
                    regex += "( "+lower+"|"+upper+")([^A-Z]+)";
                }
            }
            //add extension if available
            for(var i=1; i<parts.length; i++){
                var m = "";
                var part = "."+parts[i];
                if(!caseSensitive){ //case insensitive
                    var upper = part.toUpperCase();
                    var lower = part.toLowerCase();
                    for(var i2=0; i2<upper.length; i2++)
                        m+="["+regexEscape(lower[i2])+regexEscape(upper[i2])+"]";
                }else
                    m = regexEscape(part[i]);
                regex += "("+m+")([^A-Z]*)";
            }
            regex+="$";
            return new RegExp(regex);
        },
        getScore: function(text, regex){
            regex = regex||this.regex;
            if(regex){
                var match = regex.exec(text);
                if(!match) return null;
                
                var nScore = 1+text.length/1000;
                
                return 1/nScore;
            }else{
                throw new Error("prepareRegex(query, caseSensitive) must be called first, or regex retrieved with getRegex must be provided");
            }
        },
        highlight: function(text, clas){
            if(this.regex){
                var match = this.regex.exec(text);
                if(!match) return text;
                
                text = "";
                for(var i=1; i<match.length; i++){
                    if(i%2==1){
                        if(match[i][0].match(/\s/)) //includes a space
                            text += match[i][0]+`<span class="${clas}">`+match[i].substr(1)+`</span>`;    
                        else 
                            text += `<span class="${clas}">`+match[i]+`</span>`;
                    }else 
                        text += match[i];
                }
                return text;
            }else{
                throw new Error("prepareRegex(query, caseSensitive) must be called first");
            }
        }
    };
    Querier.wordMatch = {
        regex:null,
        prepareRegex:function(query, caseSensitive){
            this.regex = this.getRegex(query, caseSensitive);  
        },
        getRegex:function(query, caseSensitive){
            var regex = "^";
            var words = query.split(" ");
            for(var i=0; i<words.length; i++){
                var m = "";
                if(!caseSensitive){ //case insensitive
                    var upper = words[i].toUpperCase();
                    var lower = words[i].toLowerCase();
                    for(var i2=0; i2<upper.length; i2++)
                        m+="["+regexEscape(lower[i2])+regexEscape(upper[i2])+"]";
                }else
                    m = regexEscape(words[i]);
                if(i==0){
                    regex += "(.*)("+m+")";
                }else{
                    regex += "(.* .*)("+m+")";
                }
            }
            regex += "(.*)$";
            return new RegExp(regex);
        },
        getScore: function(text, regex){
            regex = regex||this.regex;
            if(regex){
                var match = regex.exec(text);
                if(!match) return null;
                match.shift();
                
                var nScore = 1;
                
                var firstMatch = match[0];
                var lastMatch = match[match.length-1];
                    
                if(firstMatch.length>0) nScore+=0.1;
                if(lastMatch.length>0) nScore+=0.1;
                
                if(firstMatch.length>0 && !/\s/.exec(firstMatch[firstMatch.length-1])) nScore+=0.1;
                if(lastMatch.length>0 && !/\s/.exec(lastMatch[0])) nScore+=0.1;
                
                for(var i=2; i<match.length-2; i+=2){
                    var length = match[i].length; 
                    nScore += length/20; //characters inbetween words aren't too important
                }
                
                nScore += (text.length-query.length)/1000;
                
                return 1/nScore;
            }else{
                throw new Error("prepareRegex(query, caseSensitive) must be called first, or regex retrieved with getRegex must be provided");
            }
        },
        highlight: function(text, clas){
            if(this.regex){
                var match = this.regex.exec(text);
                if(!match) return text;
                
                text = "";
                for(var i=1; i<match.length; i++){
                    if(i%2==0)
                        text += `<span class="${clas}">`+match[i]+`</span>`;
                    else 
                        text += match[i];
                }
                return text;
            }else{
                throw new Error("prepareRegex(query, caseSensitive) must be called first");
            }
        }
    };
    Querier.characterMatch = {
        regex:null,
        prepareRegex:function(query, caseSensitive){
            this.regex = this.getRegex(query, caseSensitive);  
        },
        getRegex: function(query, caseSensitive){
            var regex ="^";
            if(!caseSensitive){
                var upperQuery = query.toUpperCase();
                var lowerQuery = query.toLowerCase();
            }
            for(var i=0;i<lowerQuery.length;i++){
                var m;
                if(!caseSensitive){ //case insensitive
                    m = regexEscape(lowerQuery[i])+regexEscape(upperQuery[i]);
                }else
                    m = regexEscape(query[i]);
                regex += (i==0?"(.*)":"([^"+m+"]*)")+"(["+m+"])";
            }
            regex +="(.*)$";
            return new RegExp(regex);
        },
        getScore: function(text, regex){
            regex = regex||this.regex;
            if(regex){
                var match = regex.exec(text);
                if(!match) return null;
                match.shift();
                
                var nScore = 1;
                
                var firstMatch = match[0];
                var lastMatch = match[match.length-1];
                    
                if(firstMatch.length>0) nScore+=0.1;
                if(lastMatch.length>0) nScore+=0.1;
                
                if(firstMatch.length>0 && !/\s/.exec(firstMatch[firstMatch.length-1])) nScore+=0.1;
                if(lastMatch.length>0 && !/\s/.exec(lastMatch[0])) nScore+=0.1;
                
                for(var i=2; i<match.length-2; i+=2){
                    var length = match[i].length; 
                    if(length>0) nScore += length+3;
                }
                
                nScore += (text.length-query.length)/1000;
                
                return 1/nScore;
            }else{
                throw new Error("prepareRegex(query, caseSensitive) must be called first, or regex retrieved with getRegex must be provided");
            }
        },
        highlight: function(text, clas){
            if(this.regex){
                var match = this.regex.exec(text);
                if(!match) return text;
                
                text = "";
                for(var i=1; i<match.length; i++){
                    if(i%2==0)
                        text +=  `<span class="${clas}">`+match[i]+`</span>`;    
                    else 
                        text += match[i];
                }
                return text.replace(/<\/span><span[^>]*>/g,"");
            }else{
                throw new Error("prepareRegex(query, caseSensitive) must be called first");
            }
        }
    };
    Querier.matchTypes = [Querier.acronymMatch, Querier.wordMatch, Querier.characterMatch];
    
    /**
     * matchTypes have an equal importance, and will be compared based on score
     * descendants will only be checked if none of matchTypes made a match
     */
    Querier.matchTypesImportance = {matchTypes:[Querier.acronymMatch], descendants:{matchTypes:[Querier.wordMatch], descendants:{matchTypes:[Querier.characterMatch], descendants:[]}}};
    Querier.importanceDepth = 3;
    
    //provide easy powerfull matching using the match types above
    Querier.prepare = function(query, caseSensitive){
        for(var i=0; i<this.matchTypes.length; i++){
            this.matchTypes[i].prepareRegex(query, caseSensitive);
        }
    };
    Querier.test = function(text, minScore, object, regexList){
        if(!this.testRequirements(text, object)) return null;
        
        if(!minScore) minScore=0;
        var mt = this.matchTypesImportance;
        var best = null;
        var addScore = this.importanceDepth;   
        var typeIndex = 0;
        while(best==null && mt.matchTypes){
            addScore--;
            for(var i=0; i<mt.matchTypes.length; i++){
                var type = mt.matchTypes[i];
                var score = type.getScore(text, regexList?regexList[typeIndex]:null);
                if(score) score+=addScore;
                if(score!==null && score>minScore && (best==null || best.score<score)){
                    best = {score:score, type:type};
                }
                typeIndex++;
            }
            mt = mt.descendants;
        }
        return best;
    };
    Querier.regexTest = function(text, query, object){
        if(!this.testRequirements(text, object)) return null;
        
        return query.test(text)?{score:1/(1+text.length/200), type:{highlight:function(text, clas){
            query.lastIndex = 0;
            var m = query.exec(text);
            return text.substring(0,m.index)+"<span class='"+clas+"'>"+text.substr(m.index,m[0].length)+"</span>"+text.substring(m.index+m[0].length);
        }}}:null;
    };
    
    //setup additional requirements of files
    Querier.additionalRequirements = {
        min:{
            valueMatch: /^[0-9]+$/,
            parse: Number,
            def: 0,
            value:null,
            test: function(text){
                return this.value<=text.length;
            }
        },
        max:{
            valueMatch: /^[0-9]+$/,
            parse: Number,
            def: Infinity,
            value:null,
            test: function(text){
                return this.value>=text.length;
            }
        },
        minChildren:{
            valueMatch: /^[0-9]+$/,
            shorts: ["minC"],
            parse: Number,
            def: 0,
            value: null,
            testObject: function(dir){
                if(dir instanceof File) 
                    return this.value==this.def;
                if(dir instanceof Directory)
                    return this.value<=dir.children.length;
                return true;
            }
        },
        maxChildren:{
            valueMatch: /^[0-9]+$/,
            shorts: ["maxC"],
            parse: Number,
            def: Infinity,
            value: null,
            testObject: function(dir){
                if(dir instanceof File) 
                    return this.value==this.def;
                if(dir instanceof Directory)
                    return this.value>=dir.children.length;
                return true;
            }
        },
        type:{
            valueMatch: /^d|f$/i,
            shorts: ["t"],
            def: null,
            value:null,
            test: function(text){
                var type;
                if((type = this.value)!=null){
                    if(type=="d"){
                        if(text[text.length-1]!="\\") return false;
                    }else
                        if(text[text.length-1]=="\\") return false;   
                }
                return true;
            }
        },
        not:{
            valueMatch: /^.+$/,
            shorts: ["n"],
            def: [],
            multiple: true,
            init: function(){
                for(var i=0; i<this.value.length; i++){
                    this.value[i] = Querier.wordMatch.getRegex(this.value[i]);
                }
            },
            value:[],
            test: function(text){
                var not = Querier.additionalRequirements.not.value;
                for(var i=0; i<not.length; i++){
                    if(Querier.wordMatch.getScore(text,not[i])) 
                        return false;
                }
                return true;
            }
        }
    };
    {//add shorts to additionalRequirements
        var requirementKeys = Object.keys(Querier.additionalRequirements);
        for(var i=0; i<requirementKeys.length; i++){
            var key = requirementKeys[i];
            var obj = Querier.additionalRequirements[key];
            var shorts = obj.shorts;
            if(shorts)
                for(var j=0; j<shorts.length; j++){
                    Querier.additionalRequirements[shorts[j]] = obj;
                }
        }
    }
    Querier.resetRequirements = function(){
        var requirements = Object.keys(this.additionalRequirements);
        var arg;
        for(var i=0; i<requirements.length; i++) 
            (arg = this.additionalRequirements[requirements[i]]).value = 
                ((arg.def) instanceof Array)?arg.def.slice():arg.def; //deep copy default
    };
    Querier.parseRequirements = function(requirementsString){
        this.resetRequirements();
        var requirements = Object.keys(this.additionalRequirements);
        
        var args = requirementsString.split(";");
        argLoop:
        for(var i=0; i<args.length-1; i++){
            var parts = args[i].split(":");
            
            //find what argument should be altered (based on provided name, or index)
            var argName;
            var argValues;
            if(parts.length==1){
                argValues = parts[0].split(",");
                r: for(var m=0; m<requirements.length; m++){
                    argName = requirements[m];
                    arg = this.additionalRequirements[argName];
                    for(var n=0; n<argValues.length; n++){
                        if((arg.value!=arg.def && (!arg.multiple || arg.value.length>0))
                            || !arg.valueMatch.test(argValues[n])){
                            argName = null;      
                            continue r;
                        }
                    }
                    break r;
                }
                /*
                argValues = parts[0].split(",");
                requirementsLoop:
                for(var n=0; n<requirements.length; n++){
                    argName = requirements[n];
                    var arg = this.additionalRequirements[argName];
                    if(arg.parse!=Number){
                        argName = null;
                        continue;
                    }
                    for(var m=0; m<argValues.length; m++){
                        if(isNaN(Number(argValues[m]))) continue argLoop; //arg is invalid
                        
                        if(!arg.test.test(argValues[m])){
                            argName = null;
                            continue requirementsLoop;
                        }
                    }
                    break requirementsLoop;
                }
                */
            }else{
                argName = parts[0];
                argValues = parts[1].split(",");
            }
            
            //set or append value
            var arg = this.additionalRequirements[argName];
            if(arg){
                for(var n=0; n<argValues.length; n++){
                    var val = argValues[n];
                    if(arg.valueMatch.test(val)){
                        val = arg.parse?arg.parse(val):val;
                        if(arg.multiple)
                            arg.value.push(val);
                        else{
                            arg.value = val;
                            break;
                        }
                    }
                }
            }
        }
        
        //initialise values properly, if they have provided a function for it
        for(var i=0; i<requirements.length; i++){
            if((arg = this.additionalRequirements[requirements[i]]).init){
                arg.init();
            }    
        }
    }
    Querier.extractRequirements = function(query){
        query = query.split("?");
        if(query.length>1){
            var requirementsString = query[1];
            this.parseRequirements(requirementsString);
        }else{
            this.resetRequirements();
        }
        
        query = query[0];
        return query;
    };
    Querier.testRequirements = function(text, object){
        var keys = Object.keys(Querier.additionalRequirements);
        for(var i=0; i<keys.length; i++){
            var req = Querier.additionalRequirements[keys[i]];
            if(object && req.testObject && !req.testObject(object)) return false;
            if(req.test && !req.test(text)) return false;
        }
        return true;
    }
    
    //execute query
    Querier.queryList = function(query, list, getTextFunc, minScore){
        minScore = minScore || Settings.minimalMatchScore;
        
        query = this.extractRequirements(query);
        Querier.prepare(query, false);
        var matches = [];
        for(var i=0; i<list.length; i++){
            var text = null;
            if(getTextFunc) text = getTextFunc.call(list[i],list[i]);
            else            text = list[i];
            var match = this.test(text, minScore, list[i]);
            if(match!==null) matches.push({match:match, item:list[i]});
        }
        
        for(var i=0; i<this.matchTypes.length; i++) 
            this.matchTypes[i].regex = null;
        return matches;
    };
    Querier.regexQueryList = function(query, list, getTextFunc){
        query = this.extractRequirements(query);
        var m = /\/(.+)\/(\w*)/.exec(query);
        try{
            query = new RegExp(m[1], m[2]);
        }catch(e){
            return e;
        }
        
        var matches = [];
        for(var i=0; i<list.length; i++){
            var text = null;
            if(getTextFunc) text = getTextFunc.call(list[i],list[i]);
            else            text = list[i];
            var match = this.regexTest(text, query, list[i]);
            if(match!==null) matches.push({match:match, item:list[i]});
        }
        
        return matches;
    };
    Querier.query = function(query, directory, searchDepth, minScore){
        minScore = minScore || Settings.minimalMatchScore;
        searchDepth = searchDepth || Settings.searchDepth;
        
        query = this.extractRequirements(query);
        Querier.prepare(query, false);
        var matches = [];
        
        tree.each(function(file){
                var text = tree.getFullName(file);
                var match = Querier.test(text, minScore, file);
                if(match!==null) matches.push({match:match, file:file});
            }, function(dir){
                var text = tree.getFullName(dir);
                var match = Querier.test(text, minScore, dir);
                if(match!==null) matches.push({match:match, file:dir});
            }, directory, searchDepth);
            
        for(var i=0; i<this.matchTypes.length; i++) 
            this.matchTypes[i].regex = null;
        return matches;
    };
    Querier.regexQuery = function(query, directory, searchDepth){
        searchDepth = searchDepth || Settings.searchDepth;
        
        var m = /\/(.+)\/(.*)/.exec(query);
        m[2] = this.extractRequirements(m[2]);
        try{
            query = new RegExp(m[1], m[2]);
        }catch(e){
            return e;
        }
        
        var matches = [];
        tree.each(function(file){
                var text = tree.getFullName(file);
                var match = Querier.regexTest(text, query, file);
                if(match!==null) matches.push({match:match, file:file});
            }, function(dir){
                var text = tree.getFullName(dir);
                var match = Querier.regexTest(text, query, dir);
                if(match!==null) matches.push({match:match, file:dir});
            }, directory, searchDepth);
            
        return matches;
    };
    Querier.sortMatches = function(matches, maxResults, func){
        var maxResults = maxResults||Settings.maxResults;
        return Quicksort.sort(matches, function(a,b){
            var dScore = a.match.score-b.match.score;
            if(dScore!=0) return dScore>0;
            
            var nameA;
            var nameB;
            if(func){
                nameA = func.call(a.item,a.item);
                nameB = func.call(b.item,b.item);
            }else{
                nameA = a.file.getFullName();
                nameB = b.file.getFullName();
            }
            var minLength = Math.min(nameA.length, nameB.length);
            return nameA.substring(0,minLength)<nameB.substring(0,minLength);
            
            // //alphabetical order
            // var nameA = tree.fullName(a.file);
            // var nameB = tree.fullName(b.file);
            // for(var i=0; i<Math.min(nameA.length, nameB.length); i++){
            //     if(nameA[i]!=nameB[i]){
            //         var aIndex = alphabet.indexOf(nameA[i]);
            //         var bIndex = alphabet.indexOf(nameB[i]);
            //         if(aIndex!=-1 && bIndex!=-1){
            //             return aIndex<bIndex;
            //         }else if(aIndex!=-1){
            //             return true;
            //         }else if(bIndex!=-1){
            //             return false;
            //         }
            //     }
            // }
            // return false;
        }, maxResults).slice(0, Math.min(matches.length,maxResults));
    };
    
    Querier.queryListAsync = function(query, list, onComplete, getTextFunc, minScore){
        minScore = minScore || Settings.minimalMatchScore;
        
        query = Querier.extractRequirements(query);
        Querier.prepare(query, false);
        
        var regexList = [];
        for(var i=0; i<Querier.matchTypes.length; i++){
            regexList.push(Querier.matchTypes[i].regex);
            Querier.matchTypes[i].regex = null;
        }
        
        var matches = [];
        return Utils.iterate(list, function(){
                var text = null;
                if(getTextFunc) text = getTextFunc.call(this,this);
                else            text = this;
                var match = Querier.test(text, minScore, this, regexList);
                if(match!==null) matches.push({match:match, item:this});
            }, function(){
                onComplete(matches);
            });
    };
    Querier.regexQueryListAsync = function(query, list, onComplete, getTextFunc){
        query = Querier.extractRequirements(query);
        var m = /\/(.+)\/(\w*)/.exec(query);
        try{
            query = new RegExp(m[1], m[2]);
        }catch(e){
            return e;
        }
        
        var matches = [];
        return Utils.iterate(list, function(){
                var text = null;
                if(getTextFunc) text = getTextFunc.call(this,this);
                else            text = this;
                var match = Querier.regexTest(text, query, this);
                if(match!==null) matches.push({match:match, item:this});
            }, function(){
                onComplete(matches);
            });
    };
    Querier.queryAsync = function(query, directory, onComplete, searchDepth, minScore){
        minScore = minScore || Settings.minimalMatchScore;
        searchDepth = searchDepth || Settings.searchDepth;
        
        query = Querier.extractRequirements(query);
        Querier.prepare(query, false);
        
        var regexList = [];
        for(var i=0; i<Querier.matchTypes.length; i++){
            regexList.push(Querier.matchTypes[i].regex);
            Querier.matchTypes[i].regex = null;
        }
            
        var matches = [];
        return tree.eachAsync(function(file){
                var text = tree.getFullName(file);
                var match = Querier.test(text, minScore, file, regexList);
                if(match!==null) matches.push({match:match, file:file});
            }, function(dir){
                var text = tree.getFullName(dir);
                var match = Querier.test(text, minScore, dir, regexList);
                if(match!==null) matches.push({match:match, file:dir});
            }, directory, function(){
                onComplete(matches);
            }, 50, searchDepth);
    };
    Querier.regexQueryAsync = function(query, directory, onComplete, searchDepth){
        searchDepth = searchDepth || Settings.searchDepth;
        
        var m = /\/(.+)\/(.*)/.exec(query);
        m[2] = Querier.extractRequirements(m[2]);
        try{
            query = new RegExp(m[1], m[2]);
        }catch(e){
            return e;
        }
        
        var matches = [];
        return tree.eachAsync(function(file){
                var text = tree.getFullName(file);
                var match = Querier.regexTest(text, query, file);
                if(match!==null) matches.push({match:match, file:file});
            }, function(dir){
                var text = tree.getFullName(dir);
                var match = Querier.regexTest(text, query, dir);
                if(match!==null) matches.push({match:match, file:dir});
            }, directory, function(){
                onComplete(matches);
            }, 50, searchDepth);
    };
    
    return Querier;
})();


function regexEscape(str){ //is included in utilities, but needs to be here for worker to work
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
function sortMatches(matches){
    var max = Settings.maxResults;
    return Quicksort.sort(matches, function(a,b){
        var dScore = a.score-b.score;
        if(dScore!=0) return dScore>0;
        
        // var nameA = tree.fullName(a.file);
        // var nameB = tree.fullName(b.file);
        // var minLength = Math.min(nameA.length, nameB.length);
        // return nameA.substring(0,minLength)<nameB.substring(0,minLength);
        
        //alphabetical order
        var nameA = tree.fullName(a.file);
        var nameB = tree.fullName(b.file);
        for(var i=0; i<Math.min(nameA.length, nameB.length); i++){
            if(nameA[i]!=nameB[i]){
                var aIndex = alphabet.indexOf(nameA[i]);
                var bIndex = alphabet.indexOf(nameB[i]);
                if(aIndex!=-1 && bIndex!=-1){
                    return aIndex<bIndex;
                }else if(aIndex!=-1){
                    return true;
                }else if(bIndex!=-1){
                    return false;
                }
            }
        }
        return false;
    }, max).slice(0, Math.min(matches.length,max));
}
function getQueryRegex(query, casesensitive){
    var regex = "^(()";
    var lowerQuery = query.toLowerCase();
    //setup a acronym match query
    for(i=0;i<lowerQuery.length;i++){
        var escChar = regexEscape(lowerQuery[i]);
        regex += "("+escChar.toUpperCase()+(i==0?"|"+escChar:"")+")(.*)";
    }
    regex +="|";
    //setup a literal match query
    var queryWords = lowerQuery.split(" ");
    for(var i=0;i<queryWords.length;i++){
        var word = regexEscape(queryWords[i]);
        var insensitiveWord = "";
        if(!casesensitive)
            for(var i2=0; i2<word.length; i2++)
                insensitiveWord+="["+word[i2]+word[i2].toUpperCase()+"]";
        else
            insensitiveWord = word;
        regex += "(.*?"+(i>0?" .*?":"")+")("+insensitiveWord+")";
    }
    regex +="(.*)|";
    //setup a similar match query
    for(i=0;i<lowerQuery.length;i++){
        var escChar = regexEscape(lowerQuery[i]);
        var insensitiveChar = casesensitive?escChar:"["+escChar+escChar.toUpperCase()+"]"; 
        regex += (i==0?"(.*)":"([^"+escChar+"]*)")+"("+insensitiveChar+")";
    }
    regex +="(.*))";
    return new RegExp(regex);
}

function query(tree,query){
    var rQuery = "";
    var retArray = [];
    
    //Prepare regex...
    
    rQuery = "^((";
    //setup a literal match query
    var queryWords = query.split(" ");
    var literalMatchIndex = 3;
    var literalMatchLength = queryWords.length+1;
    for(var i=0;i<queryWords.length;i++){
        var word = regexEscape(queryWords[i]);
        rQuery += "(.*?"+(i>0?" .*?":"")+")"+word;
    }
    rQuery+="(.*))|(";
    //setup a similar match query
    var similarMatchIndex = literalMatchIndex+literalMatchLength+1;
    var similarMatchLength = query.length+1;
    for(i=0;i<query.length;i++){
        var escChar = regexEscape(query[i]);
        rQuery += (i==0?"(.*)":"([^"+escChar+"]*)") + escChar;
    }
    rQuery+="(.*)))";
    
    var regex = new RegExp(rQuery,"i");
    
    //Loop through files in tree
    tree.each(function(file){
        var test = file.n;
        if(file.e && file.e.length>0) test+="."+file.e;
        
        var tests = [test];
        if(test.toLowerCase()!=test){
            if(/((^[a-z]|[A-Z])[^A-Z\b]+)+/.test(test)){
                var acronym = test.replace(/(^[a-z]|[A-Z])[^A-Z\b]+/g, "$1");
                tests.push(acronym);
            }
        }
        var bestScore = 0;
        var match;
        for(var n=0; n<tests.length; n++){
            var test = tests[n];
            if((match = regex.exec(test)) != null){
                var nScore = 0;
                if(match[literalMatchIndex]!==undefined){
                    var firstMatch = match[literalMatchIndex];
                    var lastMatch = match[literalMatchIndex+literalMatchLength-1];
                    
                    /*nScore: inverted score
                    If query is the first part of name then nScore = 0 else nScore = 0.1
                    nScore == 0.1 to distinguish between "apple" and "pineapple" while searching for "apple".
                    In this case we decided that "pineapple" should be a better match.*/
                    if(firstMatch.length>0) nScore+=0.1;
                    if(lastMatch.length>0) nScore+=0.1;
                    
                    /*Add to inverted score if character before match is a letter/digit.
                    Because we decided that "pineapple" should score worse than "custard apple"
                    Ignore if firstCharacter is start of string. Otherwise this applies to "apple" inadvertantly.*/
                    if(firstMatch.length>0 && /\w/.exec(firstMatch[firstMatch.length-1])) nScore+=0.1;
                    if(lastMatch.length>0 && /\w/.exec(lastMatch[0])) nScore+=0.1;
                    
                    for(i=literalMatchIndex+1; i<literalMatchIndex+literalMatchLength-1; i++){
                        var length = match[i].length-1;
                        nScore += length/20;
                    }
                    
                    //make the name length show up in ascending order on the same level of match
                    nScore += (test.length-query.length)/1000;
                    
                    //Score inversely proportional to nScore of gaps between letters
                    var score = 1 / (1+nScore);
                    
                    /*If name matches regex, push it to the return array
                    //Default score of 1 for ease of multiplying score to
                     promote frequently matched names.*/
                     bestScore = Math.max(bestScore,score);
                }else{
                    var firstMatch = match[similarMatchIndex];
                    var lastMatch = match[similarMatchIndex+similarMatchLength-1];
                    
                    /*nScore: inverted score
                    If query is the first part of name then nScore = 0 else nScore = 0.1
                    nScore == 0.1 to distinguish between "apple" and "pineapple" while searching for "apple".
                    In this case we decided that "pineapple" should be a better match.*/
                    if(firstMatch.length>0) nScore+=0.1;
                    if(lastMatch.length>0) nScore+=0.1;
                    
                    /*Add to inverted score if character before match is a letter/digit.
                    Because we decided that "pineapple" should score worse than "custard apple"
                    Ignore if firstCharacter is start of string. Otherwise this applies to "apple" inadvertantly.*/
                    if(firstMatch.length>0 && /\w/.exec(firstMatch[firstMatch.length-1])) nScore+=0.1;
                    if(lastMatch.length>0 && /\w/.exec(lastMatch[0])) nScore+=0.1;
                    
                    /*Loop through remaining submatches and add length of submatches to inverted score.
                    These are characters in between the query characters I.E.
                    a(.*)p(.*)p(.*)l(.*)e*/
                    for(i=similarMatchIndex+1; i<similarMatchIndex+similarMatchLength-1; i++){
                        var length = match[i].length;
                        if(length>0)
                            nScore += 2+length;
                    }
                    
                    //make the name length show up in ascending order on the same level of match
                    nScore += (test.length-query.length)/1000;
                    
                    //Score inversely proportional to nScore of gaps between letters
                    var score = 1 / (1+nScore);
                    
                    /*If name matches regex, push it to the return array
                    Default score of 1 for ease of multiplying score to
                     promote frequently matched names.*/
                     bestScore = Math.max(bestScore,score);
                }
            } 
        }
        if(bestScore>Settings.minimalMatchScore)
            retArray.push({file:file,score:bestScore});
    }, null, null, Settings.searchDepth);
    
    //Return fuzzy results
    return sortMatches(retArray);
}