/*global variables Class, $, StyleHandler*/
var Style = Class("Style",{
    const: function(){
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
        var keys = Object.keys(this.colors);
        
        //create the different shades
        for(var i=0; i<keys.length; i++){
            var type = keys[i];
            //make sure it is a shade and not a specific color
            if(!/[0-9]$/.test(type)){
                var colorTransition = this.colors[type];
                if(!colorTransition instanceof Array)
                    throw Error("You must define an array with 2 colors, or specify a specific type like: "+type+"0");
                    
                //get color prefix, like fileselector_
                var specifier = (type.match(/(([0-9a-zA-Z]+_)*)[0-9a-zA-Z]+/)[2]||"").replace("_",".");
                var t = type.match(/[0-9a-zA-Z]+$/)[0];
                var type = StyleHandler.types[t];
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
                        colors["."+specifier+t+j] = [type, color];
                        var m = type.acronyms;
                        for(var p=0; p<m.length; p++){
                            colors["."+specifier+m[p]+j] = [type, color];
                        }
                    }
                }
                
            }
        }
        //overwrite specific values like background0
        for(var i=0; i<keys.length; i++){
            var type = keys[i];
            if(/[0-9]$/.test(type)){
                var color = this.colors[type];
                
                //get color prefix, like fileselector_
                var specifier = (type.match(/(([0-9a-zA-Z]+_)*)[0-9a-zA-Z]+/)[2]||"").replace("_",".");
                var t = type.match(/[0-9a-zA-Z]+$/)[0];
                var type = StyleHandler.types[t.match(/(.+)[0-9]/)[1]];
                
                //create colors with their acronyms
                colors["."+specifier+t] = [type, color];
                var m = type.acronyms;
                for(var j=0; j<m.length; j++){
                    colors["."+specifier+m[j]] = [type, color];
                }
            }
        }
        
        //create the css style
        this.style = "<style class='colors LM "+this.className+"'>\n";
        var keys = Object.keys(colors);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var type = colors[key][0];
            var color = colors[key][1];
            this.style += key+"{"+type.property+":"+color+";"+type.addition+"}\n";
        }
        this.style += "</style>";
        
        //create transition style
        this.transitionStyle = "<style class='colors LM transition "+this.className+"'>\n";
        var keys = Object.keys(colors);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var type = colors[key][0];
            this.transitionStyle += key+"{transition: "+type.property+" 0.5s}\n";
        }
        this.transitionStyle += "</style>";
    },
    colors: {},
    enable: function(){
        StyleHandler.selectStyle(this);
    },
    disable: function(){
        if(StyleHandler.selectedStyle==this)
            StyleHandler.baseStyle.enable(); //overwrite the current style
    }
});