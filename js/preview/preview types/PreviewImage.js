/*global variables Inherit, Preview, PreviewHandler, Actions, tree, fitImageInDiv, resetCall*/
var PreviewImage = Inherit("PreviewImage",{
    extensions: ["png","jpg","jpeg"],
    template:{
        html:` <img src=''>`,
        style:`img{
                    position:relative;
                    top:50%;
                    left:50%;
                    transform:translate(-50%,-50%);
                }`
    },
    hasImgLoaded: false,
    resetImg: function(){
        var img = this.$("img");
        img.attr("src", 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII=');
        this.hasImgLoaded = false;
        img.width("100%").height("100%");
    },
    loadFile: function(file){
        this.parent.loadFile(file);
        
        var t = this;
        var resetImg = resetCall(function(){t.resetImg();}, 20);
        
        var img = this.$("img");
        Actions.file.getPreview(tree.getPath(file), function(data){
            if(t.file==file){ //make sure a new file has not been selected already
                fitImageInDiv(img, data.data, 10);
                t.hasImgLoaded = true;   
            }
            if(t.file==file || !this.hasImgLoaded){
                resetImg.cancel();
            }
        });
    }
},Preview);
PreviewHandler.registerPreviewType(PreviewImage);