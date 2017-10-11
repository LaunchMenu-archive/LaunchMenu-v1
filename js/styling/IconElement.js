loadOnce("/GUIelements/baseElement");
loadOnce("ImageColorSwapper");
loadOnce("$StyleHandler");
(function(){
    const registeredImages = {};
    const colorSwappers = [];
    const colorSwappersByGradients = {};
    
    const getColorSwapper = function(src, image){
        var colorSwapperData;
        if(src){            
            //get colorSwapper
            if(registeredImages[src]){
                colorSwapperData = registeredImages[src]; //get data if a colorSwapper has already been generated 
            }else{
                var colorSwapper = new ImageColorSwapper(src, null, true); 
                colorSwapper.onReady = function(){
                    //add colorSwapper to existing colorSwappers
                    for(var styleGradient of colorSwapper.usedStylingGradients){
                        if(!colorSwappersByGradients[styleGradient]){
                            colorSwappersByGradients[styleGradient] = [];
                        }
                        colorSwappersByGradients[styleGradient].push(colorSwapper);
                    }
                    
                    //generate image and update all icons
                    this.generateImageToFile($StyleHandler.selectedStyle.colors);
                };
                //a function to update all icons when the colorSwapper updated
                colorSwapper.setGenerateCallback(function(){
                    //update all icons connected to a colorSwapper
                    var swapper = colorSwapperData.colorSwapper;
                    for(var i=0; i<colorSwapperData.connectedIcons.length; i++){
                        var icon = colorSwapperData.connectedIcons[i];
                        icon.__setImage(swapper.outputPath, swapper.width, swapper.height);
                    }
                });
                //create swapper data
                colorSwapperData = registeredImages[src] = { //save the colorSwapper data under the src name
                    colorSwapper: colorSwapper,
                    connectedIcons: [], //the icons that are on the page
                    iconCount: 0, //number of icons using this colorSwapper
                }
                colorSwappers.push(colorSwapperData);
            }
        }
        if(image){
            if(src && registeredImages[src]){ //save the colorSwapper data under the image name
                registeredImages[image] = registeredImages[src]; 
            }
            if(!colorSwapperData){
                colorSwapperData = registeredImages[src]; //get data if a colorSwapper has already been generated 
            }
        }
        return colorSwapperData;
    };
    
    window.IconElementClass = class IconElementClass extends BaseElementClass{
        constructor(data, size){
            super();
            var isPath = !data?false:data.match(/\.png|\.jpg|\.bmp/);
            
            var src = this.attr.src||(isPath?data:null);
            var image = this.attr.image||(!isPath?data:null);
            this.size = this.attr.size||size;
            
            if(src||image){ //connect a colorSwapper with image with the icon
                this.swapperData = getColorSwapper(src, image);
                this.swapperData.iconCount++;
                
                this.colorSwapper = this.swapperData.colorSwapper;
            }else{ //just use the icon font to display an icon
                var type = this.attr.type||data; 
                if(type)
                    $(this).addClass("icoMoon icon-"+type);                
            }
        }
        __initVars(){
            super.__initVars();
            this.template = {
                html: ``,
                style: `.root{
                            display: inline-block;
                            background-size: contain;
                            background-repeat: no-repeat;
                            vertical-align: bottom;
                        }`
            }
        }
        
        //image method
        __setImage(path, width, height){
            $(this).css("background-image", "url('"+path+"?n="+Date.now()+"')"); //random query added to the path, so the cached image isn't used
            if(this.size){
                var s = this.size;
                $(this).width(s).height(s);
            }else if($(this).height()==0){
                $(this).width(width).height(height);
            }
        }
        
        //
        destroy(){ //clean up all data properly if needed
            if(this.colorSwapper){
                //remove itself from icons
                this.swapperData.iconCount--;
                
                //remove colorSwapper if no longer used by any icon
                if(this.swapperData.iconCount==0){
                    index = colorSwappers.indexOf(this.swapperData);
                    if(index!=-1)
                        colorSwappers.splice(index, 1);
                }
                
                this.colorSwapper = null;
                this.swapperData = null;
            }
        }
        
        //connect/discconnect methods
        connectedCallback(){
            if(this.swapperData){
                //add itself to connected list, so it can be updated as the style changes 
                this.swapperData.connectedIcons.push(this);
                //attach the current image to the icon
                if(this.colorSwapper.outputPath && this.colorSwapper.outputAvailable)
                    this.__setImage(this.colorSwapper.outputPath, this.colorSwapper.width, this.colorSwapper.height);                
            }
        }
        disconnectedCallbback(){
            if(this.swapperData){
                //remove itself from connected list
                var n = this.swapperData.connectedIcons;
                var index = n.indexOf(this);
                if(index!=-1)
                    n.splice(index, 1);
            }
        }
        
        //update method, updates the styling of all icons, is called by $StyleHandler when the style changes
        static updateIconsWithGradient(gradientName){
            if(gradientName){ //only update affected color swappers if a gradientName was provided
                var gradientColorSwappers = colorSwappersByGradients[gradientName];
                if(gradientColorSwappers){
                    for(var swapper of gradientColorSwappers){
                        swapper.generateImageToFile($StyleHandler.selectedStyle.colors);
                    }
                }
            }else{    //update all colorSwappers if no gradientName was provided
                for(var i=0; i<colorSwappers.length; i++){
                    var swapperData = colorSwappers[i];
                    var swapper = swapperData.colorSwapper;
                    swapper.generateImageToFile($StyleHandler.selectedStyle.colors);
                }
            }
        }
    }
    window.IconElementClass.registerElement();
})();