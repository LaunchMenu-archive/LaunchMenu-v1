/*global $ lm Actions $Tree File Directory fitImageDiv*/
var Preview = (function(){
    var Preview = {};
    
    (function(){
        var $ = (function($){ //localise the jquery selector
            return function(selector){
                var q = $(selector);
                if(q.selector)
                    return $("._LM_.specificPreviewData div:visible").find(selector);
                else
                    return q;
            };
        })(jQuery);
        
        //the typeName will be added automatically
        //el will be added automatically
        Preview.types = {
            directory:{
                template: ``,
                styling:``,
                showGeneralData: true, 
                init: function(directory){
                    
                }
            },
            def:{
                template: ``,
                styling:``,
                showGeneralData: true, 
                init: function(file){
                       
                }
            },
            text:{
                extensions: ["txt"],
                template: `<div>test</div>`,
                styling:`div{
                            font-size: 30px;
                        }`,
                showGeneralData: true, 
                init: function(file){
                    
                }
            },
            image:{
                extensions: ["png","jpg","jpeg"],
                template: `<img src=''>`,
                styling: `img{
                            position:relative;
                            top:50%;
                            left:50%;
                            transform:translate(-50%,-50%);
                        }`,
                showGeneralData: true,
                reset: function(){
                    var img = $("img");
                    img.attr("src", 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII=');
                    img.width("100%").height("100%");
                },
                
                //this function will be wrapped in another function that takes care of the general data and opening the preview
                init: function(file){ 
                    var img = $("img");
                    var t = this;
                    Actions.file.getPreview($Tree.getPath(file), function(data){
                        if(t.file==file){ //make sure a new file has not been selected already
                            fitImageInDiv(img, data.data, 10);
                        }
                    });
                }
            },
        };
    })();
    Preview.extensionTypes = {};
    
    //init template
    Preview.insertTemplate = function(type){
        var styling = type.styling;
        var typeName = type.typeName;
        var template = $(`<div class=${typeName} style=display:none;width:100%;height:100%></div>`);
        template.append(type.template);
        template.find("._lm_").removeClass("_lm_");
        
        var selector = /(.*)\{([^\{\}]+)\}/g;
        styling = styling.replace(selector, `.${typeName} $1{$2}`);
        template.append("<style>"+styling+"</style>");
        
        lm(".specificPreviewData").append(template);
        type.el = template;
        
        delete type.styling;
        delete type.template;
    };
    
    var lastPreviewedFile;
    Preview.initPreview = function(name, type){
        //set typname of type
        type.typeName = name;
        
        //add type to extension
        var extensions = type.extensions;
        if(extensions)
            for(var n=0; n<extensions.length; n++){
                var extension = extensions[n];
                Preview.extensionTypes[extension] = type;
            }
        
        //add template to document
        Preview.insertTemplate(type);
        
        //wrap the init funcion in something that that retrieves the general data
        var init = type.init;
        type.init = function(file){
            lastPreviewedFile = file; //to be able to check if the asynchroniously retrieved data belongs to the last file
            
            Preview.resetGeneralData();
            if(type.reset) type.reset();
            
            //retrieve generalData
            if(type.showGeneralData){
                var generalData = {path:$Tree.getPath(file)};
                Preview.setGeneralData(null, null, null, null, generalData.path);
                // var trySetData = function(){
                //     if(lastPreviewedFile == file){
                //         if(generalData.creationDate!==undefined && generalData.size!==undefined){
                //             Preview.setGeneralData(generalData.formattedSize, generalData.creationDate, generalData.modificationDate, generalData.accessDate, generalData.path);
                //         }
                //     }
                // };
                
                Actions.file.getDates(generalData.path, function(dates){
                    generalData.creationDate = dates.dateCreated;
                    generalData.modificationDate = dates.dateModified;
                    generalData.accessDate = dates.dateAccessed;
                    if(lastPreviewedFile == file)
                        Preview.setGeneralData(null, dates.dateCreated, dates.dateModified, dates.dateAccessed, null);
                    // trySetData();
                });
                Actions.file.getSize(generalData.path, function(size){
                    generalData.size = size;
                    var ar = [[1, " Bit", "s"], [8, " Byte", "s"], [1024, "KB"], [1024, "MB"], [1024, "GB"]];
                    generalData.formattedSize = "0 Bits";
                    for(var i=0; i<ar.length; i++){
                        if(size>=ar[i][0]){
                            size = Math.round(size/ar[i][0]);
                            generalData.formattedSize = size+ar[i][1]+(size.length!=1&&ar[i][2]?ar[i][2]:"");
                        }else
                            break;
                    
                    }
                    if(lastPreviewedFile == file)
                        Preview.setGeneralData(generalData.formattedSize, null, null, null, null);
                    // trySetData();
                });
                
                type.generalData = generalData;
            }
            
            type.file = file;
            
            //show preview
            Preview.openPreview(type);
            init.call(type, file, type.generalData);
        };
    };
    
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
    Preview.resetGeneralData = function(){
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
    Preview.setGeneralData = function(size, creationDate, modificationDate, accessDate, path){
        if(creationDate!==null)     generalData.creationDate.setVal(creationDate);
        if(modificationDate!==null) generalData.modificationDate.setVal(modificationDate);
        if(accessDate!==null)       generalData.accessDate.setVal(accessDate);
        if(size!==null)             generalData.size.setVal(size);
        if(path!==null)             generalData.path.setVal(path.replace(/\\/g, "\\<wbr>"));
    };
    
    Preview.openPreview = function(preview){
        $(".lm.specificPreviewData").find(">div:visible").hide();
        preview.el.show();
        if(!preview.showGeneralData)    lm(".preview").addClass("full");
        else                            lm(".preview").removeClass("full");
    };
    Preview.previewFile = function(file){
        if(file instanceof Directory){
            Preview.types.directory.init(file);
        }else if(file instanceof File){
            var type = Preview.extensionTypes[file.e];
            (type||Preview.types.def).init(file);
        }
    };
    
    //init templates
    $(function(){
        var typeNames = Object.keys(Preview.types);
        for(var i=0; i<typeNames.length; i++){
            var typeName = typeNames[i];
            var type = Preview.types[typeName];
            
            Preview.initPreview(typeName, type);
        }
    });
    
    return Preview;
})();