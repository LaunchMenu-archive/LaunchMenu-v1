/*global $ initTemplates loadTemplate tree query settings Directory regexEscape*/
$(function(){
    var lastQuery = "";
    $(".input").keydown(function(e){
         setTimeout(function(){
            var queryText = $(".input").val();
            if(queryText.length>0){
                $(".placeHolder").hide();
            }else{
                $(".placeHolder").show();
            }
            if(queryText!=lastQuery){
                search(queryText);
                lastQuery = queryText;
            }
         });
    });
    $(window).keydown(function(e){
        if(e.key=="Escape"){
            if($(".input").val()==""){
				invokeAction("WindowHide")
			}else{
				$(".input").val("");
				$(".placeHolder").show();
			}
        }
    });
    var matchesHeight = $(".matches").height();
    var prevOffset = 0;
    $(".matches").scrollbar({
        verticalMargin:{top:5,bottom:5},
        scrollListener: function(offset){
            var lc = settings.loadFileCount;
            var loadedFiles = $(".file");
            if(prevOffset!=offset && loadedFiles.length>0){
                var phl = $(".filesPlaceholder.lower");
                var phu = $(".filesPlaceholder.upper");
                if(Math.abs(prevOffset-offset)<lc*fileHeight){
                    var lastFile = loadedFiles.last();
                    var lastOffset = lastFile.position().top-offset-matchesHeight;
                    var firstFile = loadedFiles.first();
                    var firstOffset = firstFile.position().top-offset;
                    if(lastFile.length){
                        //unload files that are not in view
                        var removeItems = $();
                        loadedFiles.each(function(){
                            var t = $(this);
                            var topOffset = t.position().top-offset;
                            if(topOffset<-matchesHeight-(lc+4)*fileHeight){
                                phu.height(phu.height()+fileHeight);
                                removeItems = removeItems.add(t);
                            }else if(topOffset>matchesHeight+(lc+4)*fileHeight){
                                phl.height(phl.height()+fileHeight);
                                removeItems = removeItems.add(t);
                            }
                        });
                        removeItems.each(function(){
                            $(this).remove(); 
                        });
                        
                        //load more files when reaching the end
                        if(lastOffset<20){
                            var lastIndex = Number(lastFile.attr("ID"))+1;
                            for(var i=lastIndex; i<Math.min(lastIndex+lc,matchedFiles.length); i++){
                                addMatchedFile(matchedFiles[i], i);
                                phl.height(phl.height()-fileHeight);
                            }
                        }
                        
                        // load more files when reaching the start
                        if(firstOffset>-20){
                            var firstIndex = Number(firstFile.attr("ID"))-1;
                            for(var i=firstIndex; i>=Math.max(firstIndex-lc,0); i--){
                                firstFile = addMatchedFile(matchedFiles[i], i, firstFile);
                                phu.height(phu.height()-fileHeight);
                            }
                        }
                    }
                }else{
                    phu.height(phu.height()+loadedFiles.length*fileHeight);
                    loadedFiles.remove();
                    var index =Math.floor(offset/fileHeight)-1;
                    
                    var newUpperHeight = index*fileHeight;
                    var upperDelta = newUpperHeight-phu.height();
                    
                    phu.height(newUpperHeight);
                    phl.height(phl.height()-upperDelta);
                    //226402
                    for(var i=Math.max(0,index); i<Math.min(index+lc,matchedFiles.length); i++){
                        addMatchedFile(matchedFiles[i], i);
                        phl.height(phl.height()-fileHeight);
                    }
                }
                prevOffset = offset;
            }
        }
    });
     
    initTemplates(".file");
});

function invokeAction(action, callback){
    var ipc = require('electron').ipcRenderer;
    if(callback) ipc.once('actionReply', callback);
    ipc.send('invokeAction',action);
}

function windowSetSize(size){
    var ipc = require('electron').ipcRenderer;
    ipc.send('windowSetSize',size);
}

var fileHeight = 41;

var matchedFiles = [];
var searchHighlightRegex;
function search(text){
    $(".file").remove();
    $(".filesPlaceholder").height(0);
    $(".matches").scrollbar("reset");
    
    {
        searchHighlightRegex = "^(()";
        var lowerText = text.toLowerCase();
        //setup a acronym match query
        for(i=0;i<lowerText.length;i++){
            var escChar = regexEscape(lowerText[i]);
            searchHighlightRegex += "("+escChar.toUpperCase()+(i==0?"|"+escChar:"")+")(.*)";
        }
        searchHighlightRegex +="|";
        //setup a literal match query
        var queryWords = lowerText.split(" ");
        for(var i=0;i<queryWords.length;i++){
            var word = regexEscape(queryWords[i]);
            var insensitiveWord = "";
            for(var i2=0; i2<word.length; i2++)
                insensitiveWord+="["+word[i2]+word[i2].toUpperCase()+"]";
            searchHighlightRegex += "(.*?"+(i>0?" .*?":"")+")("+insensitiveWord+")";
        }
        searchHighlightRegex +="(.*)|";
        //setup a similar match query
        for(i=0;i<lowerText.length;i++){
            var escChar = regexEscape(lowerText[i]);
            searchHighlightRegex += (i==0?"(.*)":"([^"+escChar+"]*)")+"(["+escChar+escChar.toUpperCase()+"])";
        }
        searchHighlightRegex +="(.*))";
        searchHighlightRegex = new RegExp(searchHighlightRegex);
    }
    
    if(text.length>0){
        matchedFiles = query(tree, text);
    }else
        matchedFiles = [];
    
    if(matchedFiles.length>0){
        $(".noFileMessage").hide();
        
        var resultMap = [];
        for(var i=0; i<matchedFiles.length; i++){
            var result = matchedFiles[i];
            
            var dir = result.file;
            var path = [];
            while((dir.p) instanceof Directory){
                dir = dir.p;
                path.unshift(dir);
            }
            resultMap.push({path:path, result:result});
        }
    
        var startDir;
        outer: for(var n=0;n<300;n++){
            var dir = resultMap[0].path[n];
            for(var i=1; i<resultMap.length; i++){
                var result = resultMap[i];
                var newDir = result.path[n];
                if(dir!=newDir || newDir==undefined) break outer;
            }
            if(dir==undefined) break outer;
            startDir = dir;
        }
        
        $(".rootPathText").html(tree.toPath(startDir).replace(/\\/g, "\\<wbr>"));
        
        $(".matches").css("height","calc(100% - "+($(".rootPathText").height()+2)+"px)");
        
        for(var i=0; i<matchedFiles.length; i++){
            var result = matchedFiles[i];
            result.path = tree.toPath(result.file.p, startDir);
        }
        
        //add files and such
        for(var i=0; i<Math.min(settings.loadFileCount,matchedFiles.length); i++){
            addMatchedFile(matchedFiles[i], i);
        }
        var filesLeft = matchedFiles.length-settings.loadFileCount;
        $(".filesPlaceholder.lower").height(Math.max(0, fileHeight*filesLeft));
        
    }else{ 
        if(text.length>0){
            $(".noFileMessage").show();
        }
        $(".rootPathText").text("");
    }
    $(".matches").scrollbar("refresh");
}

function addMatchedFile(matchedFile, index, before){
    if(!before) before=$(".filesPlaceholder.lower");
    var fileEl = loadTemplate(".file", null, before);
    fileEl.attr("ID",index);
    var file = matchedFile.file;
    
    var name = file.e?file.n+"."+file.e:file.n;
    var match = searchHighlightRegex.exec(name);
    if(match){
        var opened = true;
        var index = 0;
        for(var i=2; i<match.length; i++){
            var m = match[i];
            if(m!==undefined){
                opened = !opened;
                var tag = opened?"<span>":"</span>";
                name = name.substring(0,index)+tag+name.substring(index);
                index+=tag.length+m.length;
            }
        }
    }
    name = name.replace("</span>","");
    
    
    fileEl.find(".fileName").html(name);
    
    var path = matchedFile.path;
    while(path.length>35){
        var oldPath = path;
        path = path.replace(/(\.\.\.\\)?([^\\]*)\\/,"...\\");
        if(oldPath==path){
            break;   
        }
    }
    fileEl.find(".filePath").text(path);
    return fileEl;
}