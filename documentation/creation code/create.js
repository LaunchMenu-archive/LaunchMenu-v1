var comments = [];
for(var i=0; i<files.length; i++){
    comments.push([]);
    var file = files[i];
    var defRegex = /\/\*\*(((.|\n)(?!\*\/))*)(.|\n)\*\//g;
    var defMatch;
    while(defMatch = defRegex.exec(file)){
        var def = defMatch[1];
        var paramRegex = /(\w+)\s*:\s*(.+)/g;
        var paramMatch;
        var obj = {};
        while(paramMatch = paramRegex.exec(def)){
            obj[paramMatch[1]] = paramMatch[2];
        }
        if(Object.keys(obj).length>0)
            comments[comments.length-1].push(obj);
    }
    if(comments[comments.length-1].length==0) comments.pop();
}
