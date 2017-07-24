/*global variables Class, $, $StyleHandler*/
loadOnce("$StyleHandler");
window.Style = class Style{
	/*
	 inpColors should be an object containing the following keys:
		 - background
		 - border
		 - font
		 - fontError
		 - backgroundHighlight
	 where each key is an array with 2 css colors, and a gradient will be create inbetween those colors
	 
	 you can also specify a specific index of the gradient values by adding a key to the inpColors like this:
	 	background2: "#fff"
	    
	 a complete inpColors object could look something like this:
	  	{
  			background: ["#FFF", "#CCCCCC"],
            border: ["#EEE", "#888"],
            font: ["rgb(0,0,0)", "#BBB"],
            fontError: ["#900","#D00"],
            backgroundHighlight: ["#00e9ff", "#8cf5ff"]
            background3: #DDD
       }
	 */
    constructor(inpColors){
    	this.__initVars();
    	
        var getRGB = function(color){ //extract rgb data
            var match = $("<n></n>").css("color",color).css("color").match(/[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+/);
            if(!match){
                throw Error(color+" is not a supported color");
            }
            color = [];
            color[0] = Number(match[1]);
            color[1] = Number(match[2]);
            color[2] = Number(match[3]);
            return color;
        };
        var getColor = function(color1, color2, per){ //mix colors
            var r = Math.sqrt(Math.pow(color2[0],2)*per+Math.pow(color1[0],2)*(1-per));
            var g = Math.sqrt(Math.pow(color2[1],2)*per+Math.pow(color1[1],2)*(1-per));
            var b = Math.sqrt(Math.pow(color2[2],2)*per+Math.pow(color1[2],2)*(1-per));
            return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        };
        
        //acronyms
        var colors = {};
        var keys = Object.keys(inpColors);
        
        //create the different shades
        for(var i=0; i<keys.length; i++){
            var type = keys[i];
            //make sure it is a shade and not a specific color
            if(!/[0-9]$/.test(type)){
                var colorTransition = inpColors[type];
                if(!colorTransition instanceof Array)
                    throw Error("You must define an array with 2 colors, or specify a specific type like: "+type+"0");
                    
                //get color prefix, like fileselector_
                var specifier = (type.match(/(([0-9a-zA-Z]+_)*)[0-9a-zA-Z]+/)[2]||"").replace("_",".");
                var t = type.match(/[0-9a-zA-Z]+$/)[0];
                var type = $StyleHandler.types[t];
                if(type){
                    if(!type.addition) type.addition="";
                    
                    //get the 2 colors
                    var color1 = getRGB(colorTransition[0]);
                    var color2 = getRGB(colorTransition[1]);
                    
                    var shadeCount = type.shades;
                    //create all shades
                    for(var j=0; j<shadeCount; j++){
                        var per = j/(shadeCount-1);
                        var color = getColor(color1, color2, per);
            
                        //create colors with their acronyms
                        colors[specifier+t+j] = [type, color, j];
//                        var m = type.acronyms;
//                        for(var p=0; p<m.length; p++){
//                            colors["."+specifier+m[p]+j] = [type, color];
//                        }
                    }
                }
                
            }
        }
        //overwrite specific values like background0
        for(var i=0; i<keys.length; i++){
            var type = keys[i];
            if(/[0-9]$/.test(type)){
                var color = inpColors[type];
                
                //get color prefix, like fileselector_
                var specifier = (type.match(/(([0-9a-zA-Z]+_)*)[0-9a-zA-Z]+/)[2]||"").replace("_",".");
                var t = type.match(/[0-9a-zA-Z]+$/)[0];
                var type = $StyleHandler.types[t.match(/(.+)[0-9]/)[1]];
                
                //create colors with their acronyms
                colors[specifier+t] = [type, color];
//                var m = type.acronyms;
//                for(var j=0; j<m.length; j++){
//                    colors["."+specifier+m[j]] = [type, color];
//                }
            }
        }
        
        //create element selector
        var hovers = ["Hover","H"];
        var createSelector = function(selectors, index, dontRemoveComma){
        	var selectorString = "";
            for(var n=0; n<selectors.length; n++){
            	var selector = "."+selectors[n];
            	if(n+1!=selectors.length)
            		selector += index;
            	selectorString += ","+selector;
            	for(var m=0; m<hovers.length; m++){
            		selectorString += ","+selector+hovers[m]+":hover";
            	}
            }
            return selectorString.substring(dontRemoveComma?0:1);
        }
        
        //create the css style
        this.style = "<style class='colors LM "+this.constructor.name+"'>\n";
        var keys = Object.keys(colors);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var type = colors[key][0];
            var color = colors[key][1];
            var index = colors[key][2];
            
            //create css selector
            var selectorString = createSelector(type.acronyms.concat(key), index);
            
            //create style
            this.style += selectorString+"{"+type.property+":"+color+";"+type.addition+"}\n";
        }
        this.style += "</style>";
        
        //create transition style
        this.transitionStyle = "<style class='colors LM transition "+this.constructor.name+"'>\n";
        var transitionSelector = "";
        var keys = Object.keys(colors);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var type = colors[key][0];
            var index = colors[key][2];

            //create css selector
            transitionSelector += createSelector(type.acronyms.concat(key), index, true);
        }
        this.transitionStyle += transitionSelector.substring(1)+`{
        	transition: all ${$StyleHandler.transitionDuration}s ease;
        	transition-property: color, background-color, border-color;
        }`
        this.transitionStyle += "</style>";
    }
    __initVars(){}
    
    enable(){
        $StyleHandler.selectStyle(this);
    }
    disable(){
        if($StyleHandler.selectedStyle==this)
            $StyleHandler.baseStyle.enable(); //overwrite the current style
    }
}