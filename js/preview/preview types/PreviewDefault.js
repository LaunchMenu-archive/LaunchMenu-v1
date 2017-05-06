/*global variables Inherit, Preview, PreviewHandler*/
PreviewHandler.registerPreviewType(
    Inherit("PreviewDefault",{
        default: true,
        template:{
            html: ``,
            style:``
        },
        loadFile: function(file){
            this.super.loadFile(file);
        }
    },Preview)
);