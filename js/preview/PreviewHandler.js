/*global Class lm*/
var PreviewHandler = (function(){
    var ph = {};
    
    var openedPreview = null;
    ph.previewByExtension = {
        get openedPreview(){
            return openedPreview;
        },
        set openedPreview(preview){
            preview.open();
        }
    };
    ph.previewList = [];
    ph.registerPreviewType = function(preview){
        var name = preview.className;
        if(ph.previewList.indexOf(preview)!=-1){
            throw new Error("Preview type already registered");
        }else{
            ph.previewList.push(preview);
            var n = ph.previewByExtension;
            for(var i=0; i<preview.extensions.length; i++){
                var ext = preview.extensions[i];
                
                if(n[ext]){
                    if(!(n[ext] instanceof Array)) n[ext] = [n[ext]];
                    n[ext].push(preview);
                }else{
                    n[ext] = preview;
                }
            }
            
            var n = createTemplateElement(name, preview.template);
            var element = n.element;
            element.css({width:"100%",height:"100%",display:"none"});
            lm(".specificPreviewData").append(element);
            preview.$ = n.querier;
            preview.element = element;
        }
    };
    
    ph.getPreviewFromExtension = function(extension){
        var n = ph.previewByExtension[extension];
        return (n instanceof Array)?n[0]:n;
    };
    ph.setOpenedPreview = function(preview){
        if(openedPreview!=preview){
            if(openedPreview){
                openedPreview.close();
            }
            openedPreview = preview;
        }
    };
    
    ph.openFile = function(file){
        ph.getPreviewFromExtension(file.extension).loadFile(file);
    }
    
    
    var generalData = {
        creationDate:{val:"", setVal: 
            function(val){this.val=val; this.reset=false; lm(".dateCreated .dataValue").text(val);}
        },modificationDate:{val:"", setVal: 
            function(val){this.val=val; this.reset=false; lm(".dateModified .dataValue").text(val);}
        },accessDate:{val:"", setVal: 
            function(val){this.val=val; this.reset=false; lm(".dateAccessed .dataValue").text(val);}
        },size:{val:"", setVal: 
            function(val){this.val=val; this.reset=false; lm(".size .dataValue").text(val);}
        },path:{val:"", setVal: 
            function(val){this.val=val; this.reset=false; lm(".path").html(val);}  
        },timeout: null
    };
    ph.resetGeneralData = function(){
        generalData.creationDate.reset = true;
        generalData.modificationDate.reset = true;
        generalData.accessDate.reset = true;
        generalData.size.reset = true;
        generalData.path.reset = true;
        clearTimeout(generalData.timeout);
        generalData.timeout = setTimeout(function(){
            if(generalData.creationDate.reset)      generalData.creationDate.setVal("");
            if(generalData.modificationDate.reset)  generalData.modificationDate.setVal("");
            if(generalData.accessDate.reset)        generalData.accessDate.setVal("");
            if(generalData.size.reset)              generalData.size.setVal("");
            if(generalData.path.reset)              generalData.path.setVal("");
        },500);
    };
    ph.setGeneralData = function(size, creationDate, modificationDate, accessDate, path){
        if(creationDate!==null && creationDate!==undefined)
            generalData.creationDate.setVal(creationDate);
        if(modificationDate!==null && modificationDate!==undefined) 
            generalData.modificationDate.setVal(modificationDate);
        if(accessDate!==null && accessDate!==undefined)       
            generalData.accessDate.setVal(accessDate);
        if(size!==null && size!==undefined)             
            generalData.size.setVal(size);
        if(path!==null && path!==undefined)             
            generalData.path.setVal(path.replace(/\\/g, "\\<wbr>"));
    };
    
    ph.hideGeneralData = function(){
        lm(".preview").addClass("full");
    };
    ph.showGeneralData = function(){
        lm(".preview").removeClass("full");
    };
    
    return ph;
})();