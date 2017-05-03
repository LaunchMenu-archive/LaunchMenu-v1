/*global variables Class, $*/
var Style = Class("Style",{
    const: function(){
        var getRGB = function(color){
            var match = $("<n></n>").css("color",color).css("color").match(/[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+/);
            var color = [];
            color[0] = Number(match[1]);
            color[1] = Number(match[2]);
            color[2] = Number(match[3]);
            return color;
        }
        var getColor = function(color1, color2, per){
            var r = Math.sqrt(Math.pow(color2[0],2)*per+Math.pow(color1[0],2)*(1-per));
            var g = Math.sqrt(Math.pow(color2[1],2)*per+Math.pow(color1[1],2)*(1-per));
            var b = Math.sqrt(Math.pow(color2[2],2)*per+Math.pow(color1[2],2)*(1-per));
            return `rgb(${r}, ${g}, ${b})`;
        };
        
        var types = {
            "background":   ["bg"],
            "border":       ["bd"],
            "font":         ["f"]
        };
        var colors = {};
        var keys = Object.keys(this.colors);
        
        var shadeCount = 10;
        for(var i=0; i<keys.length; i++){
            var type = keys[i];
            if(!/[0-9]$/.test(type)){
                var colorTransition = this.colors[type];
                var color1 = getRGB(colorTransition[0]);
                var color2 = getRGB(colorTransition[1]);
                for(var j=0; j<shadeCount; j++){
                    var per = j/(shadeCount-1);
                    var color = getColor(color1, color2, per);
                    
                    var specifier = (type.match(/(([0-9a-z]+_)*)[0-9a-z]+/)[2]||"").replace("_",".");
                    var t = type.match(/[0-9a-z]+$/)[0];
                    
                    colors[specifier+t] = color;
                    var m = types[t];
                    for(var p=0; p<m.length; p++){
                        colors[specifier+m[p]] = color;
                    }
                }
            }
        }
        for(var i=0; i<keys.length; i++){
            var type = keys[i];
            if(/[0-9]$/.test(type)){
                var color = this.colors[type];
                var specifier = (type.match(/(([0-9a-z]+_)*)[0-9a-z]+/)[2]||"").replace("_",".");
                var t = type.match(/[0-9a-z]+$/)[0];
                
                colors[specifier+t] = color;
                var m = types[t.match(/(.+)[0-9]/)[1]];
                for(var j=0; j<m.length; j++){
                    colors[specifier+m[j]] = color;
                }
            }
        }
        console.log(colors);
    },
    colors: {
        background: ["#FFF", "#DDD"],
        background5: "orange",
        border: ["#CCC", "#999"],
        font: ["#000", "#555"],
        fileselector_background: ["#FFF", "#DDD"],
    }
});