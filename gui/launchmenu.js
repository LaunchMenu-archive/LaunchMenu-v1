/*global $ initTemplates loadTemplate tree Querier Settings Directory regexEscape*/
var lastQuery = "";
$(function(){
    $(".input").keydown(function(e){
         setTimeout(function(){
            var queryText = $(".input").val();
            if(queryText.length>0){
                $(".placeHolder").hide();
            }else{
                $(".placeHolder").show();
            }
            if(queryText!=lastQuery){
                setTimeout(function(){
                    search(queryText);
                });
                lastQuery = queryText;
            }
         });
         if(e.key=="ArrowDown" || e.key=="ArrowUp")
            e.preventDefault();
    });
    var keyPause = false;
    $(window).keydown(function(e){
        if(e.key=="Escape"){
            if($(".input").val()==""){
				invokeAction("WindowHide");
			}else{
				$(".input").val("");
				$(".placeHolder").show();
			}
        }
        var n;
        if(e.key=="ArrowDown") n = $(".file.selected").next(".file")[0];
        if(e.key=="ArrowUp") n = $(".file.selected").prev(".file")[0];
        if(n && !keyPause){
            keyPause = true;
            setTimeout(function(){keyPause = false;},70);
            
            n.select();
            $(".matches")[0].focus($(n), 200);
            e.preventDefault();
        }
        if(e.key=="Enter"){
            var n = $(".file.selected")[0];
            n.launch();
        }
    });
    var matchesHeight = $(".matches").height();
    var prevOffset = 0;
    $(".matches").scrollbar({
        verticalMargin:{top:5,bottom:5},
        scrollListener: function(offset){
            var lc = Settings.loadFileCount;
            var loadedFiles = $(".file");
            if(prevOffset!=offset){
                var phl = $(".filesPlaceholder.lower");
                var phu = $(".filesPlaceholder.upper");
                if(Math.abs(prevOffset-offset)<lc*fileHeight && loadedFiles.length>0){
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
                            Querier.prepare(Querier.extractRequirements(lastQuery));
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
                    loadedFiles.remove();
                    
                    var index =Math.floor(offset/fileHeight)-1;
                    var newUpperHeight = index*fileHeight;
                    
                    phu.height(newUpperHeight);
                    phl.height(totalFilesHeight-newUpperHeight);
                    
                    Querier.prepare(Querier.extractRequirements(lastQuery));
                    for(var i=Math.max(0,index); i<Math.min(index+lc,matchedFiles.length); i++){
                        addMatchedFile(matchedFiles[i], i);
                        phl.height(phl.height()-fileHeight);
                    }
                }
                prevOffset = offset;
            }
            disableMouseMove = true;
        }
    });
     
    initTemplates(".file");
});

var fileHeight = 41;

var disableMouseMove = false;
var matchedFiles = [];
var totalFilesHeight = 0;
function search(text){
    if(!$(".body").is(".expanded")) $(".body").addClass("expanded");
    
    $(".matches").scrollbar("reset");
    $(".file").remove();
    
    var error;
    if(text.length>Settings.minimalSearchLength){
        if(/\/(.+)\/(\w*)/.test(text))
            matchedFiles = Querier.regexQuery(text, tree);
        else
            matchedFiles = Querier.query(text, tree);
        if(!(matchedFiles instanceof Array)){
            error = matchedFiles;
            matchedFiles = [];
        }else{
            matchedFiles = Querier.sortMatches(matchedFiles);
        }
        $(".filesPlaceholder").height(0);
    }else{
        matchedFiles = [];
        if($(".body").is(".expanded")) $(".body").removeClass("expanded");
    }
    totalFilesHeight = matchedFiles.length*fileHeight;
    
    $(".noFileMessage,.regexErrorMessage").hide();
    if(matchedFiles.length>0){
        
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
        Querier.prepare(Querier.extractRequirements(lastQuery));
        for(var i=0; i<Math.min(Settings.loadFileCount,matchedFiles.length); i++){
            addMatchedFile(matchedFiles[i], i);
        }
        var filesLeft = matchedFiles.length-Settings.loadFileCount;
        $(".filesPlaceholder.lower").height(Math.max(0, fileHeight*filesLeft));
        
        var n = $(".file")[0];
        if(n) n.select();
    }else{ 
        if(text.length>0){
            if(error){
                $(".regexErrorMessage .regexError").text(error.message);
                $(".regexErrorMessage").show();
            }else{
                $(".noFileMessage").show();
            }
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
    fileEl.data("file", file);
    
    var name = matchedFile.match.type.highlight(tree.fullName(file), "lm");
    
    
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
    
    fileEl[0].launch = function(){
        console.log(name);
    }
    fileEl[0].select = function(){
        if(!$(this).is(".selected")){
            $(".file.selected").removeClass("selected");
            $(this).addClass("selected");
        }
    };
    fileEl.click(fileEl[0].launch);
    fileEl.mousemove(function(){
        if(!disableMouseMove)
            fileEl[0].select();
        disableMouseMove = false;
    });
    
    return fileEl;
}