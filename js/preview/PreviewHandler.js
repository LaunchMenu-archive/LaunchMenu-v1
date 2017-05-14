/*global variables Class, Utils, File, Directory*/
var PreviewHandler = (function(){
    var previewList = [];
    var openedPreview = null;
    var previewByExtension = {};
    var defaultPreview;
    var directoryPreview;
    var ph = {
        get openedPreview(){
            return openedPreview;
        },
        set openedPreview(preview){
            preview.open();
        },
        get previewList(){
            return previewList;    
        },
        get previewByExtension(){
            return previewByExtension;
        },
        get defaultPreview(){
            return defaultPreview;
        },
        get directoryPreview(){
            return directoryPreview;
        }
    };
    
    ph.registerPreviewType = function(preview){
        if(previewList.indexOf(preview)!=-1){
            throw new Error("Preview type is already registered");
        }else{
            previewList.push(preview);
            var n = previewByExtension;
            for(var i=0; i<preview.extensions.length; i++){
                var ext = preview.extensions[i];
                
                if(n[ext]){
                    if(!(n[ext] instanceof Array)) n[ext] = [n[ext]];
                    n[ext].push(preview);
                }else{
                    n[ext] = preview;
                }
            }
            
            Utils.lm(".specificPreviewData").append(preview.element);
            preview.element.show();
            preview.htmlInitialisation();
            preview.element.hide();
            
            if(preview.default)
                defaultPreview = preview;
            if(preview.directory)
                directoryPreview = preview;
        }
    };
    
    ph.setOpenedPreview = function(preview){
        if(openedPreview!=preview){
            if(openedPreview){
                openedPreview.close();
            }
            openedPreview = preview;
            return true;
        }
        return false;
    };
    ph.getPreviewFromExtension = function(extension){
        var n = previewByExtension[extension];
        if(!n) return defaultPreview;
        return (n instanceof Array)?n[0]:n;
    };
    ph.openFile = function(file){
        var n;
        if(file instanceof File){
            n = ph.getPreviewFromExtension(file.extension);
        }else if(file instanceof Directory){
            n = directoryPreview;
        }else{
            throw new Error("first argument must be either a file or a directory");
        }
        
        if(n) n.loadFile(file);
        else if(openedPreview){
            openedPreview.close();
            openedPreview = null;
        }
    };  
    
    var generalData = {
        creationDate:{val:"", setVal: 
            function(val){
                this.val=val; 
                this.reset=false; 
                var n = Utils.lm(".dateCreated");
                if(val.toLowerCase()=="none")   n.hide();
                else                            n.show();
                n.children(".dataValue").text(val);}
        },modificationDate:{val:"", setVal: 
            function(val){
                this.val=val; 
                this.reset=false; 
                var n = Utils.lm(".dateModified");
                if(val.toLowerCase()=="none")   n.hide();
                else                            n.show();
                n.children(".dataValue").text(val);}
        },accessDate:{val:"", setVal:  
            function(val){
                this.val=val; 
                this.reset=false; 
                var n = Utils.lm(".dateAccessed");
                if(val.toLowerCase()=="none")   n.hide();
                else                            n.show();
                n.children(".dataValue").text(val);}
        },size:{val:"", setVal:  
            function(val){
                this.val=val; 
                this.reset=false; 
                var n = Utils.lm(".size");
                if(val.toLowerCase()=="none")   n.hide();
                else                            n.show();
                n.children(".dataValue").text(val);}
        },path:{val:"", setVal: 
            function(val){
                this.val=val; 
                this.reset=false; 
                var n = Utils.lm(".path");
                if(val.toLowerCase()=="none")   n.hide();
                else                            n.show();
                n.html(val);} 
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
        Utils.lm(".preview").removeClass("full");
    };
    
    return ph;
})();