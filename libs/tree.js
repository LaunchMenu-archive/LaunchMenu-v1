function Tree(fileArray){
    this.t = "root";
    this.c = [];
    //find directory or file based on filepath
    //if create is set to tue, and the file or path doesn't exist, it will be created
    //root defines where to search from, so you can pass a directory if it is a relative path from that directory
    this.find = function(path, root, create){
        //get sub parts of the path
        var pathParts = path.split("\\");
        
        //the current dir that is being searched through
        var selectedDir = root||this;
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
                            selectedDir.c.push(directory); 
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
    this.fullName = function(directory){
        if(directory instanceof File){
            return directory.n+"."+directory.e;
        }else if(directory instanceof Directory){
            return directory.n+"\\";
        }
    };
    
    //retrieve the file path of a give directory or file
    this.toPath = function(directory){
        var path = "";
        //loop through all directory parents
        while(!(directory instanceof Tree)){
            //add the directory name to the file path
            path = this.fullName(directory)+path;
            //set the directory to be the parent of the current directory
            directory = directory.p;
        }
        return path;
    };
    
    //delete a file or directory from the tree
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
    
    //convert an array of filepaths to the proper structure and add it to the tree
    this.convert = function(fileArray){
        //loop through file array
        for(var i=0; i<fileArray.length; i++){
            var file = fileArray[i];
            //find the file within the tree, and set the create opion to be true
            this.find(file, null, true);
        }
        return this;
    };
    
    this.each = function(fileFunc, dirFunc, directory){
        directory = directory||this;
        
        var indexArray = [0];
        var lastIndex = function(){return indexArray[indexArray.length-1];};
        var increaseIndex = function(){indexArray[indexArray.length-1]++;};
        var exitDir = function(){
            indexArray.pop();
            curDir = curDir.p;
        };
        var curDir = directory;
        
        while(curDir){
            if(curDir instanceof File){ //if directory is actually a file
                if(fileFunc) 
                    fileFunc.call(curDir, curDir);
                exitDir();
            }else{ //if directory is a directory
                if(lastIndex()<curDir.c.length){ //go to next child if there are any left
                    curDir = curDir.c[lastIndex()];
                    increaseIndex();
                    indexArray.push(0);
                }else{ //exit directory if there are no children left
                    if(dirFunc && curDir instanceof Directory)
                        dirFunc.call(curDir, curDir);
                    exitDir();
                }
            }
        }
    };
    
    //add the passed files to the tree
    this.convert(fileArray);
}
function File(n,p){
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
function Directory(n,p){
    this.p = p; //parent directory
    this.n = n; //directory name
    this.c = [];//directory children
}

/*global dirs*/
var tree = new Tree(dirs);
