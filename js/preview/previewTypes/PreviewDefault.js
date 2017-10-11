/*global variables Inherit, Preview, $PreviewHandler*/
loadOnce("../Preview")
$PreviewHandler.registerPreviewType(
    class PreviewDefault extends Preview{
        __initVars(){
            super.__initVars();
            this.default = true;
            this.template = {
                html: ``,
                style:``
            };
        }
        __onLoadFile(file){
            super.__onLoadFile(file);
        }
    }
);