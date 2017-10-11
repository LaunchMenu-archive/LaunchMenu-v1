loadOnce("/$Utils");
loadOnce("/styling/$StyleHandler");
(function(){    
    /*
     * colorMapJson file format:
     * {
     *         imageColor: gradientName                (Image color is a css representation of the color in your image, gradientName is the name of a style gradient(including the index))
     *         imageColor:    {                            (You can also define new gradients, if no existing gradient fits your needs, it will automatically be added to the settings) 
     *             name: String,                        (The name of the gradient, which will also become the html class name)
     *             useIndex: Number                    (The index of the gradient to use, this will be 0 by default)
     *             etc..                                (Apart from the specific 2 properties above, you can use any style gradient property, look at the definition in StyleHandler)
     *                                                 (The property 'default' is part of the style gradient properties, and is required)
     *         }
     * }
     * 
     * example:
     *         {
     *            "#FF0000": "errorFont0",
     *            "#FFFFFF": {
     *                "name": "iconWhite",
     *                "default": "#FFFFFF"
     *            }
     *        }
     */
    
    var fs = require("fs");
    window.ImageColorSwapper = class ImageColorSwapper{
        constructor(imagePath, colorMap, usedWithStyling){ //usedWithStyling indicates if the colorMap values should be style classes
            var img;
            if(imagePath instanceof Image){ //if an image and colorMap is provided, use that for the image map straight away
                img = imagePath;
                this.createImageMap(img, colorMap);
            }else{ //get image from path
                this.relativePath = imagePath;
                imagePath = $Utils.fixPath($Utils.rootPath()+"/"+imagePath);
                img = new Image();
                var t = this;
                if(!colorMap){//if no colorMap was provided, look for an colorMap file                    
                    var imgLoaded = false;
                    
                    var colorPath = imagePath.split(".");
                    colorPath.pop();
                    colorPath = colorPath.join(".")+".json";
                    fs.readFile(colorPath, "utf8", function(err, data){
                        if(err){
                            console.error(err);
                        }else{
                            colorMap = JSON.parse(data);
                        }
                        //make sure the image has also loaded before proceeding
                        if(imgLoaded)
                            t.__createImageMap(img, colorMap, usedWithStyling);
                    });
                    img.onload = function(){
                        imgLoaded = true;
                        //make sure the colorMap has also loaded before proceeding
                        if(colorMap)
                            t.__createImageMap(img, colorMap, usedWithStyling);
                    }
                }else{
                    //generate the image map when the image has loaded
                    img.onload = this.__createImageMap.bind(this, img, colorMap, usedWithStyling);                    
                }
                img.src = imagePath;
            }
            this.ready = false; 
        }
        __createImageMap(img, colorMap, usedWithStyling){ //usedWithStyling indicates if the colorMap values should be style classes
            this.imageMap = [];
            this.colorClassList = [];
            this.usedStylingGradients = [];
            this.width = img.width;
            this.height = img.height;
            var colorList = Object.keys(colorMap);
            var colorCombos = [];
            //format the color list and create colorMap;
            for(var i=0; i<colorList.length; i++){
                var color = colorList[i];
                var colorValues = $("<div></div>").css("color",color).css("color")
                    .match(/[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)?/);
                colorValues.shift();
                colorValues[3] = parseFloat(colorValues[3])*255||255;
                
                var val = colorMap[colorList[i]];
                colorList[i] = colorValues.map(function(n){return parseFloat(n)});
                this.colorClassList.push(val);
            }
            
            //create classes in styling if needed and register the used gradientStyle names
            if(usedWithStyling){
                for(var i=0; i<this.colorClassList.length; i++){
                    var val = this.colorClassList[i];
                    if(val instanceof Object){
                        var name = val.name;
                        var index = val.useIndex||0;
                        
                        //don't keep the swapper specific data in the actual style data
                        delete val.name; 
                        delete val.useIndex;
                        
                        //create custom style if not defined already
                        if(!$StyleHandler.customTypes[name])
                            $StyleHandler.registerCustomGradient(name, val, true); //register class without updating icons
                        
                        //swap out the object for the style class name
                        val = name+index;
                        this.colorClassList[i] = val;
                    }
                    
                    if(typeof val == "string"){
                        //add color to the used styling gradients array
                        var gradientName = val.match(/(.*?)[0-9]*$/);
                        if(gradientName){
                            gradientName = gradientName[1];
                            this.usedStylingGradients.push(gradientName);
                        }                    
                    }
                }
            }
            
            //create combos of all colors
            for(var i=0; i<colorList.length; i++){
                for(var j=0; j<i; j++){
                    colorCombos.push([i, j]);
                }
            }
            this.colorList = colorList;

            //also add a transparent version of each color
            for(var i=colorList.length-1; i>=0; i--){
                this.colorClassList.push(null);
                var val = colorList[i].map(function(n){return n});
                val[3] = 0;
                colorCombos.push([i, colorList.length]);
                colorList.push(val);
            }
            
            //function to check how well the color matches a gradient
            const getColorMatch = function(color, colorCombo){
                var av = 0;
                var pers = [];
                var dif = 0;
                
                for(var i=0; i<4; i++){
                    var v1 = colorCombo[0][i];
                    var v2 = colorCombo[1][i];
                    var delta = v2-v1;
                    if(Math.abs(delta)>0){                        
                        var per = (color[i]-v1)/delta;
                        pers.push(per);
                        av += per;
                    }else{
                        var per = Math.abs(color[i]-v1)/255;                
                        dif += per;
                    }
                }
                
                av/=pers.length;
                if(pers.length<4)
                    dif/=(4-pers.length);
                
                for(var i=0; i<pers.length; i++)
                    dif += Math.abs(pers[i]-av);
                
                return [dif, av];
            }
            
            //create a canvas to analyze the image
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            
            //create imageMap
            ctx.drawImage(img, 0, 0, img.width, img.height);
            for(var x=0; x<this.width; x++){
                var n = [];
                for(var y=0; y<this.height; y++){
                    var color = ctx.getImageData(x,y,1,1).data;
                    if(color[0]==0 & color[1]==0 & color[2]==0 & color[3]==0){ //pixel is fully transparent
                        n.push(null);    
                    }else{
                        //get style class of most similar color
                        var bestMatch;
                        var smallestDif = Infinity;
                        for(var i=0; i<colorCombos.length; i++){
                            var combo = colorCombos[i];
                            var [dif, per] = getColorMatch(color, [colorList[combo[0]],colorList[combo[1]]]);
                            if(dif<smallestDif){
                                smallestDif = dif;
                                bestMatch = [combo[0], combo[1], per];
                            }
                        }
                        
                        n.push(bestMatch);            
                    }
                }
                this.imageMap.push(n);
            }
            this.ready = true;
            if(this.onReady)
                this.onReady();
        }
        generateImage(colorMap){
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext('2d');
            
            var notFoundList = [];
            for(var x=0; x<this.width; x++){
                for(var y=0; y<this.height; y++){
                    var p = this.imageMap[x][y];
                    if(p){ //pixel is not null/transparent
                        var style1 = this.colorClassList[p[0]];
                        var style2 = this.colorClassList[p[1]];
                        var per = p[2];
                        
                        //find colors
                        var color1 = colorMap[style1];
                        if(style1!=null && color1==null && notFoundList.indexOf(p[0])==-1){
                            notFoundList.push(p[0]);
                            console.error(style1+" was not provided in the color map");
                        }
                        var color2 = colorMap[style2];
                        if(style2!=null && color2==null && notFoundList.indexOf(p[1])==-1){
                            notFoundList.push(p[1]);
                            console.error(style2+" was not provided in the color map");
                        }
                        
                        //create transparent colors if needed
                        if(style1==null && color2){
                            color1 = color2.map(function(n){return n});
                            color1[3] = 0;
                        }
                        if(style2==null && color1){
                            color2 = color1.map(function(n){return n});
                            color2[3] = 0;
                        }
                        
                        if(color1 && color2){                            
                            //mix colors
                            var color = [];
                            for(var i=0; i<4; i++){
                                color[i] = Math.floor((1-per)*color1[i]+per*color2[i]);
                            }
                            
                            //draw pixel
                            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]/255})`;
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                }
            }            
            return canvas.toDataURL();
        }
        setGenerateCallback(callback){
            this.generatedCallback = callback;
        }
        generateImageToFile(colorMap, filePath, callback){
            
            filePath = filePath||this.relativePath;
            if(!filePath) throw Error("no filepath was provided");
            
            //get and create path
            var path = $Utils.fixPath($Utils.rootPath()+"/resources/generatedImages/"+filePath);
            $Utils.mkDirp(path);
            this.outputPath = path;
            this.outputAvailable = false;
            
            //write file to location
            var t= this;
            fs.writeFile(path, this.generateImage(colorMap).replace(/^data:image\/png;base64,/, ""), 'base64', function(err) {
                if(err){
                    console.error(err);
                }else{
                    t.outputAvailable = true;
                    if(t.generatedCallback)
                        t.generatedCallback.call(t);
                    if(callback)
                        callback.call(t);
                }
            });
        }
    }
})();