/*global $ lm*/
var Preview = (function(){
    var Preview = {};
    
    (function(){
        var $ = (function($){ //localise the jquery selector
            return function(selector){
                var q = $(selector);
                if(q.selector)
                    return $(".lm.specificPreviewData div:visible").find(selector);
                else
                    return q;
            };
        })(jQuery);
        
        //the typeName will be added automatically
        //el will be added automatically
        Preview.types = {
            text: {
                extensions: ["txt"],
                template: `<div>test</div>`,
                styling:`div{
                            font-size: 30px;
                        }`,
                showGeneralData: true, 
                init: function(file){
                    
                }
            },
            image: {
                extensions: ["png","jpg","jpeg"],
                template: `<img src=''>`,
                styling: ``,
                showGeneralData: false,
                init: function(file){
                    var img = $("img");
                    img.width("100%").height("100%");
                    
                }
            },
        };
    })()
    Preview.extensionTypes = {};
    
    //init template
    Preview.insertTypeTemplate = function(type){
        var styling = type.styling;
        var typeName = type.typeName;
        var template = $(`<div class=${typeName} style=display:none></div>`);
        template.append(type.template);
        template.find(".lm").removeClass("lm");
        
        var selector = /(.*)\{([^\{\}]+)\}/g;
        styling = styling.replace(selector, `.${typeName} $1{$2}`);
        template.append("<style>"+styling+"</style>");
        
        $(".lm.specificPreviewData").append(template);
        type.el = template;
    };
    Preview.initPreview = function(name, type){
        //set typname of type
        type.typeName = name;
        
        //add type to extension
        var extensions = type.extensions;
        for(var n=0; n<extensions.length; n++){
            var extension = extensions[n];
            Preview.extensionTypes[extension] = type;
        }
        
        //add template to document
        Preview.insertTypeTemplate(type);
    };
    
    Preview.openPreview = function(preview){
        $(".lm.specificPreviewData").find(">div:visible").hide();
        preview.el.show();
        if(!preview.showGeneralData)    lm(".preview").addClass("full");
        else                lm(".preview").removeClass("full");
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