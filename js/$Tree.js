/*global variables $Main*/
(function(){
//    // async version with basic error handling
//    //given a path e.g. walk('.',function(e){console.log(e)}) (<- wrong, walk takes more args)
//    function generateFileList(dir, callback){
//        var list = []
//        if(dir[0]=='.'){
//            dir = __dirname + dir.substring(1)
//        }
//        walkDir(dir,function(path){
//            // console.log(path);
//            list.push(path);
//        }, function(){
//            callback(list);
//        });
//    }
    function walkDir(dir, callback, complete, n) {
        if(!n) n = [0];
        
        var fs = require('fs'),
            path = require('path');
            
        n[0]++;
        fs.readdir(dir, function(err, files){
            if(err){
                throw new Error(err);
            }
            files.forEach(function (name) {
                var filePath = path.join(dir, name);
                var stat = fs.statSync(filePath);
                if(stat.isFile()){
                    callback($Utils.fixPath(filePath.replace(/\//g,"\\")), stat);
                }else if(stat.isDirectory()){
                    callback($Utils.fixPath(filePath.replace(/\//g,"\\") + '\\'), stat);
                    walkDir(filePath, callback, complete, n);
                }
            });
            if(--n[0]==0 && complete){
                complete();
            }
        });
    }
    
    function Tree(){
        this.t = "root";
        this.c = [];
        this.__defineGetter__("children", function(){
            return this.c;
        });
        this.seperator = "/";
        this.rootPaths = [];
        //find directory or file based on filepath
        //if create is set to true, and the file or path doesn't exist, it will be created
        //root defines where to search from, so you can pass a directory if it is a relative path from that directory
        this.find = function(path, create, root){
            //the current dir that is being searched through
            var selectedDir;
            
            //look through roots to find which this path falls under
            if(!root){
                outer:{                    
                    for(var rootIndex=0; rootIndex<this.c.length; rootIndex++){
                        var root = this.c[rootIndex];
                        var name = root.getFullName();
                        
                        //if root was found, remove root from path, and set initial dir
                        if(name==path.substring(0,name.length)){
                            path = path.substring(name.length);
                            selectedDir = root;
                            break outer;
                        }
                    }                
                    return null;
                }
            }else{
                selectedDir = root;
            }
            
            //get sub parts of the path
            var pathParts = path.split(this.seperator);
            
            //loop through all path parts tp find the corresponding directory
            for(var partIndex=0; partIndex<pathParts.length; partIndex++){
                var pathPart = pathParts[partIndex];
                //make sure it is not the end of directory path > some/path/ 
                if(pathPart.length>0){
                    
                    //check if the file pathpart is a file or directory based on the index of the part
                    var isFile = partIndex==pathParts.length-1;
                    
                    //the case insensitive match that has been found
                    var foundCaseInsensitive;
                    
                    //selecting the directory based on the pathpart
                    select:{
                        //loop through directories to check if the directory exists
                        for(var childIndex=0; childIndex<selectedDir.c.length; childIndex++){
                            var child = selectedDir.c[childIndex];
                            if(isFile){
                                //only match files if the pathpart is a file
                                if(child instanceof File){
                                    //check if the file has the same name
                                    if(child.n+"."+child.e == pathPart){
                                        return child;//return the file
                                    }
                                }
                            }else{
                                //only match directories if the pathpart is a directory
                                if(child instanceof Directory){
                                    //check if the file has the same name
                                    if(child.n == pathPart){
                                        //set the next seelcted dir to be the found directory
                                        selectedDir = child;
                                        //break select to prevent it from doing more searches, and eventually creating the directory
                                        break select; 
                                        
                                    //check if a version of the file with another case exists
                                    }else if(child.n.toLowerCase() == pathPart.toLowerCase()){
                                        //set the caseInsensitive match to be the found directory
                                        foundCaseInsensitive = child;
                                    }
                                }
                            }
                        }
                        
                        //ifcreating is enabled, create the directory or file, as it has not been found
                        if(create){
                            if(isFile){
                                //create a file if filepath is file
                                var file = new File(pathPart, selectedDir);
                                //add the file to the current directory
                                selectedDir.c.push(file);
                                return file; //return the file
                            }else{
                                //create a directory if filepath is directory
                                var directory = new Directory(pathPart, selectedDir);
                                //add the directory to the current directory
                                selectedDir.c.unshift(directory); 
                                selectedDir = directory; //set the next selected directory to be the new directory
                            }
                        //if create is not disabled, and it found an case insensitive match, use that match
                        }else if(foundCaseInsensitive){
                            selectedDir = foundCaseInsensitive;
                        //no match has been found or could be created, so return null;
                        }else{
                            return null;
                        }
                    }
                }
                
            }
            //return the found directory;
            return selectedDir;
        };
        
        //get full name of directory or file, to be used in a file path for instance
        this.getFullName = function(directory){
            if(directory instanceof File){
                return directory.n+(directory.e?"."+directory.e:"");
            }else if(directory instanceof Directory){
                return directory.n+this.seperator;
            }
        };
        this.getDisplayName = function(directory){
            if(directory instanceof Directory)
                if(this.rootPaths.indexOf(directory.n)!=-1)
                    return directory.n.split(this.seperator).pop()+this.seperator;
            return this.getFullName(directory);
        }
        
        //retrieve the file path of a give directory or file
        this.getPath = function(directory, startDir){
            var path = "";
            //loop through all directory parents
            while(!(directory instanceof Tree) && directory!=startDir){
                //add the directory name to the file path
                path = this.getFullName(directory)+path;
                //set the directory to be the parent of the current directory
                directory = directory.p;
            }
            return path;
        };
        
        //delete a file or directory from the $Tree
        this.delete = function(directory){
            //get the parent directory of a file or directory
            var parent = directory.p;  
            //get the index of the directory in its parent's children
            var index = parent.c.indexOf(directory);
            if(index>=0){
                //remove the found index from its parent's children
                parent.c.splice(index, 1);
            }
            return this;
        };
                
        //loop through a directory to execute functions on all files or sub directories
        this.each = function(fileFunc, dirFunc, directory, maximumDepth){
            directory = directory||this;
            
            var indexArray = [0]; //an array of the index it is at, in every directory
            var curDir = directory; //the directory that is currently being looped through
            var lastIndex = function(){return indexArray[indexArray.length-1];}; //get the index it is at in curDir
            var increaseIndex = function(){indexArray[indexArray.length-1]++;}; //increase the index in curdir
            var exitDir = function(){
                indexArray.pop();
                curDir = curDir.p;
            }; //exit curdir
            
            while(curDir && indexArray.length>0){
                if(curDir instanceof File){ //if directory is actually a file
                    if(fileFunc) 
                        fileFunc.call(curDir, curDir);
                    exitDir();
                }else{ //if directory is a directory
                    if(lastIndex()<curDir.c.length){ //go to next child if there are any left
                        var dir = curDir.c[lastIndex()]; //select the child dir
                        increaseIndex();
                        if(!maximumDepth || maximumDepth>indexArray.length){
                            curDir = dir;
                            indexArray.push(0);
                        }
                    }else{ //exit directory if there are no children left
                        if(dirFunc && curDir instanceof Directory && indexArray.length>1)
                            dirFunc.call(curDir, curDir);
                        exitDir();
                    }
                }
            }
        };
        
        //loop through a directory to execute functions on all files or sub directories
        this.eachAsync = function(fileFunc, dirFunc, directory, onComplete, maxTime, maximumDepth){
            if(!maxTime) maxTime = 25;
            
            directory = directory||this;
            
            var indexArray = [0]; //an array of the index it is at, in every directory
            var curDir = directory; //the directory that is currently being looped through
            var lastIndex = function(){return indexArray[indexArray.length-1];}; //get the index it is at in curDir
            var increaseIndex = function(){indexArray[indexArray.length-1]++;}; //increase the index in curdir
            var exitDir = function(){
                indexArray.pop();
                curDir = curDir.p;
            }; //exit curdir
            
            var timeoutID;
            var func = function(){
                //get millis when the looping started
                var startTime = Date.now();
                outer:{
                    inner:{
                        while(curDir && indexArray.length>0){
                            if(Date.now()-startTime>maxTime) 
                                break inner;//stop looping and prevent onComplete from being executed
                            
                            if(curDir instanceof File){ //if directory is actually a file
                                if(fileFunc) 
                                    fileFunc.call(curDir, curDir);
                                exitDir();
                            }else{ //if directory is a directory
                                if(lastIndex()<curDir.c.length){ //go to next child if there are any left
                                    var dir = curDir.c[lastIndex()]; //select the child dir
                                    increaseIndex();
                                    if(!maximumDepth || maximumDepth>indexArray.length){
                                        curDir = dir;
                                        indexArray.push(0);
                                    }
                                }else{ //exit directory if there are no children left
                                    if(dirFunc && curDir instanceof Directory && indexArray.length>1)
                                        dirFunc.call(curDir, curDir);
                                    exitDir();
                                }
                            }
                        }
                        
                        //fire onComplete and prevent a timeout to be set
                        if(onComplete)
                            onComplete(); 
                        break outer;
                    }
                    //register the function to continue in the next cycle
                    timeoutID = setTimeout(func,0);
                }
            };
            func();
            
            return function(){
                clearTimeout(timeoutID);
            };
        };
        
        //convert an array of filepaths to the proper structure and add it to the $Tree
        this.convert = function(fileArray){
            //loop through file array
            for(var i=0; i<fileArray.length; i++){
                var file = fileArray[i];
                //find the file within the $Tree, and set the create opion to be true
                this.find(file, true);
            }
            return this;
        };

        this.addRoot = function(root, oncomplete){
            if(this.rootPaths.indexOf(root)==-1){
                root = $Utils.fixPath(root);
                var t = this;
                var dir = new Directory(root, this);
                this.rootPaths.push(root);
                this.c.push(dir);
                walkDir(root, function(path){
                    t.find(path, true);
                }, oncomplete);                
            }
        };

        const fs = require("fs");
        const savePath = $Utils.fixPath($Utils.dataPath()+"\\dirs.txt"); 
        this.saveDirsDebug = function(){
            var paths = [];
            this.each(function(file) {
                paths.push(file.getPath());
            }, function(dir) {
                paths.push(dir.getPath());
            });
            
            fs.writeFile(savePath, JSON.stringify([this.rootPaths, paths]), function(error) {
                if(error){
                    console.error("File names weren't able to be saved: ", error);
                }else{
                    console.info("File names saved succesfully");
                }
            });
        };
        this.loadDirsDebug = function(callback){
            var t = this;            
            fs.readFile(savePath, 'utf8', function(error, data){
                if(error){
                    console.error("File names weren't able to load: ", error);
                }else{
                    var data = JSON.parse(data);
                    for(var i=0; i<data[0].length; i++){
                        var root = data[0][i];
                        var dir = new Directory(root, t);
                        t.rootPaths.push(root);
                        t.c.push(dir);
                    }
                    t.convert(data[1]);
                    if(callback)
                        callback();
                    console.info("File names loaded succesfully");
                }
            });
        };
        
//        //add the passed files to the $Tree
//        this.convert(fileArray);
        this.loadDirsDebug(function(){
            $Main.fileSelector.search();
        });
    }
    
    //File class
    {
        window.File = function(n,p){
            this.p = p; //parent directory
            var m = /(.+)[.](.+)/.exec(n); 
            if(m){
                this.n = m[1]; //file name
                this.e = m[2]; //file extension
            }else{
                this.n = n;    //file name
                this.e = "";   //file extension
            }
        }
        File.prototype.__defineGetter__("name", function(){
            return this.n;
        });
        File.prototype.__defineSetter__("name", function(n){
            this.n = n;
        });
        File.prototype.__defineGetter__("parent", function(){
            return this.p;
        });
        File.prototype.__defineSetter__("parent", function(p){
            this.p = p;
        });
        File.prototype.__defineGetter__("extension", function(){
            return this.e;
        });
        File.prototype.__defineSetter__("extension", function(e){
            this.e = e;
        });
    //    File.prototype.__defineGetter__("className", function(){
    //        return "File";
    //    });
        File.prototype.getPath = function(startDir){
            return $Tree.getPath(this, startDir);
        };
        File.prototype.delete = function(){
            return $Tree.delete(this);
        };
        File.prototype.getFullName = function(){
            return $Tree.getFullName(this);
        };
        File.prototype.getDisplayName = function(){
            return $Tree.getDisplayName(this);
        };
        File.prototype.setCut = function(state){
            var wasCut = this.cut;
            if(state){
                this.cut = true;
                if(!wasCut)
                    $Main.setCutFile(this);
            }else{
                delete this.cut;
                if(wasCut)
                    $Main.resetCutFile();
            }
        };
    }
    
    //Directory class
    {
        window.Directory = function(n,p){
            this.p = p; //parent directory
            this.n = n; //directory name
            this.c = [];//directory children
        }
        Directory.prototype.__defineGetter__("name", function(){
            return this.n;
        });
        Directory.prototype.__defineSetter__("name", function(n){
            this.n = n;
        });
        Directory.prototype.__defineGetter__("parent", function(){
            return this.p;
        });
        Directory.prototype.__defineSetter__("parent", function(p){
            this.p = p;
        });
        Directory.prototype.__defineGetter__("children", function(){
            return this.c;
        });
        Directory.prototype.__defineSetter__("children", function(c){
            this.c = c;
        });
    //    Directory.prototype.__defineGetter__("className", function(){
    //        return "Directory";
    //    });
        Directory.prototype.getPath = function(startDir){
            return $Tree.getPath(this, startDir);
        };
        Directory.prototype.find = function(path, create){
            return $Tree.find(path, create, this);
        };
        Directory.prototype.each = function(fileFunc, dirFunc, maxDepth){
            return $Tree.each(fileFunc, dirFunc, this, maxDepth);
        };
        Directory.prototype.eachAsync = function(fileFunc, dirFunc, onComplete, maxTime, maxDepth){
            return $Tree.eachAsync(fileFunc, dirFunc, this, onComplete, maxTime, maxDepth);
        };
        Directory.prototype.delete = function(){
            return $Tree.delete(this);
        };
        Directory.prototype.getFullName = function(){
            return $Tree.getFullName(this);
        };
        Directory.prototype.getDisplayName = function(){
            return $Tree.getDisplayName(this);
        };
        Directory.prototype.setCut = function(state){
            var wasCut = this.cut;
            if(state){
                this.cut = true;
                if(!wasCut)
                    $Main.setCutFile(this);
            }else{
                delete this.cut;
                if(wasCut)
                    $Main.resetCutFile();
            }
        };
    }
    
    /*global dirs files*/
    window.$Tree = new Tree();
    return $Tree;
})();