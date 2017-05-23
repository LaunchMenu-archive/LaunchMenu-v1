/*global variables Inherit, Preview, PreviewHandler*/
PreviewHandler.registerPreviewType(
    Inherit("PreviewDefault",{
        default: true,
        template:{
            html: ``,
            style:``
        },
        onLoadFile: function(file){
            this.super.onLoadFile(file);
        }
    },Preview)
);