loadOnce("../BaseElement");
loadOnce("$Utils");
loadOnce("HorizontalGradientSliderElement");
loadOnce("VerticalGradientSliderElement");
loadOnce("GradientSliderElement");
loadOnce("ColorPreviewElement");
loadOnce("ColorTemplateElement");
loadOnce("../inputs/StringInputElement");
loadOnce("/styling/IconElement");
(function(){
    //colorpicker data in settings
    var defaultColors = [    "#000000","#444444","#888888","#CCCCCC","#FFFFFF",
                            "#FF0000","#FF6A00","#FFD800","#B6FF00","#4CFF00",
                            "#00FF21","#00FF90","#00FFFF","#0094FF","#0026FF",
                            "#4800FF","#B200FF","#FF00DC","#FF006E"];
    for(var i=0; i<defaultColors.length; i++){
        $Settings.colorPicker.colors[i] = {
            settingInvisible: true,
            defaultValue: defaultColors[i]
        };
    }
    var settingColors = $Settings.colorPicker.colors; 
    
    const hueColors = [[255,0,0],[255,255,0],[0,255,0],[0,255,255],[0,0,255],[255,0,255]]; 
    const rgbToHsv = function(rgb, dontFixHue){
        var p = [[0, rgb[0]], [1, rgb[1]], [2, rgb[2]]];
        p.sort(function(a,b){
            return a[1]-b[1];
        });

        var l = hueColors.length;
        for(var i=0; i<l; i++){
            var c1 = hueColors[i];
            var c2 = hueColors[(i+1)%l];

            //check if rgb is between c1 and c2
            if(c1[p[0][0]] != c2[p[0][0]] || c1[p[0][0]]!=0) continue;
            if(c1[p[2][0]] != c2[p[2][0]] || c1[p[2][0]]!=255) continue;
            if(c1[p[1][0]] == c2[p[1][0]]) continue;

            //get hsv
            var saturation = 1-p[0][1]/p[2][1];
            if(isNaN(saturation)) saturation = 0;
            var value = p[2][1]/255;
        
            var dif = p[2][1]-p[0][1];
            var per = (p[1][1]-p[0][1])/dif;
            if(i%2==1) per = 1-per;
            var hue = per/l+i/l;
            if(isNaN(hue) && !dontFixHue) hue = 0;
            
            //return value
            var ret = [hue, saturation, value];
            if(rgb[3]!=null) ret[3]=rgb[3];
            return ret;
        }
    }
    const hsvToRgb = function(hsv){
        var l = hueColors.length;
        for(var i=0; i<l; i++){
            if(yPer<=(i+1)/l){
                var per = (yPer-i/l)/(1/l);
                var c = $Utils.getColorPer(hueColors[i], hueColors[(i+1)%l], hsv[0]);
                c = $Utils.getColorPerLinear([255,255,255], c, hsv[1]);
                var ret = $Utils.getColorPerLinear([0,0,0], c, hsv[2]);
                
                if(hsv[3]!=null) ret[3]=hsv[3];
                return c;
            }
        }
    };
    const rgbToHex = function(rgba){
        var out = "#";
        for(var i=0; i<rgba.length; i++){
            out += (rgba[i]<16?"0":"")+rgba[i].toString(16);
        }            
        return out;
    };
    const hexToRgb = function(hex){
        var out = [];
        if(!hex[0].match(/[0-9a-fA-Z]/)) hex = hex.substring(1);
        if(hex.length<6){
            for(var i=0; i<hex.length && i<4; i++)
                out.push(parseInt(hex[i], 16)*17);
        }else{
            for(var i=0; i<hex.length/2 && i<4; i++)
                out.push(parseInt(hex.substr(i*2,2), 16));
        }
        return out;
    };
    
    window.ColorPickerElementClass = class ColorPickerElementClass extends BaseElementClass{
        constructor(color, listener, allowAlpha){
            super(function(){
                this.color = color;                
            });
            this.listener = listener;
        }
        __initVars(){
            super.__initVars();
            this.template = {
                html:  `<div class=mainSection>
                            <c-gradient-slider class='hsvSlider sv'></c-gradient-slider>
                            <c-vertical-gradient-slider class='hsvSlider h'></c-vertical-gradient-slider>
                            <div class=previewAndPallet>
                                <c-string-input></c-string-input>
                                <c-color-preview></c-color-preview>
                                <div class=colorTemplates>
                                    <div class=addTemplateButton>
                                        <c-icon type=plus></c-icon>
                                    </div>
                                </div>
                            </div>
                            <br style=clear:both>
                        </div>
                        <div class=rgbaSliders>
                            <div class=rgbaLabel>Red</div>         <c-horizontal-gradient-slider class='r rgbaSlider'></c-horizontal-gradient-slider>
                            <div class=rgbaLabel>Green</div>     <c-horizontal-gradient-slider class='g rgbaSlider'></c-horizontal-gradient-slider>
                            <div class=rgbaLabel>Blue</div>     <c-horizontal-gradient-slider class='b rgbaSlider'></c-horizontal-gradient-slider>
                            <div class=rgbaLabel>Alpha</div>     <c-horizontal-gradient-slider class='a rgbaSlider'></c-horizontal-gradient-slider>
                        </div>`,
                style: `.root{
                            width: 300px;
                            height: 276px;
                        }
                        .mainSection>*{
                            float: left;
                        }
                        .sv{
                            width: 144px;
                        }
                        .h{
                            width: 33px;
                        }
                        
                        .previewAndPallet{
                            padding: 4px;
                            width: 115px;
                        }
                        .previewAndInput>*{
                            float: left;
                        }
                        c-color-preview{
                            width: 100%;
                            height: 20px;
                        }
                        c-string-input{
                            width: 100%;
                            margin-bottom: 4px;
                        }
                        .colorTemplates{
                            width: 100%;
                            margin-top: 4px;
                            height: 91px;
                        }
                        c-color-template, .addTemplateButton{
                            width: 19px;
                            height: 19px;
                            margin-right: 5px;
                            margin-bottom: 5px;
                            float: left;
                        }
                        c-color-template:nth-child(5n){
                            margin-right: 0px;
                        }
                        c-color-template:nth-child(n+15){
                            margin-bottom: 0px;
                        }
                        .addTemplateButton{
                            margin: 0px;
                            padding: 2px;
                            box-sizing: border-box;
                            cursor: pointer;
                        }
                                                
                        .hsvSlider{
                            height: 144px;
                        }
                        
                        .rgbaLabel{
                            width: 40px;
                            height: 23px;
                            line-height: 23px;
                            padding: 5px;                            
                            float: left;
                        }
                        .rgbaSlider{
                            width: calc(100% - 50px);
                            height: 33px;
                            float: left;
                        }
                        `
            }
        }
        __initHtml(){
            super.__initHtml();
            var t = this;
            
            //create a reference to the sliders in order to control the values
            this.hSlider = this.$(".hsvSlider.h")[0];
            this.svSlider = this.$(".hsvSlider.sv")[0];
            this.rSlider = this.$(".rgbaSlider.r")[0];
            this.gSlider = this.$(".rgbaSlider.g")[0];
            this.bSlider = this.$(".rgbaSlider.b")[0];
            this.aSlider = this.$(".rgbaSlider.a")[0];
            this.preview = this.$("c-color-preview")[0];
            this.input = this.$("c-string-input")[0];
            
            //set up saturation value color slider
            this.hSlider.setListener(function(color, per, init){
                if(!init) //don't fire if the initialisation caused the event
                    t.svSlider.setGradient(function(xPer, yPer){
                        var xColor = $Utils.getColorPerLinear([255,255,255,color[3]], color, xPer);
                        return $Utils.getColorPerLinear(xColor, [0,0,0,color[3]], yPer);
                    });
            });
            this.svSlider.setVerticalResolution(50);
            this.svSlider.setHorizontalResolution(50);
            this.svSlider.setListener(function(color, leftPer, topPer, init){
                if(!init) //don't fire if the initialisation caused the event
                    t.setColor(color, this);
            });
            
            //set up rgba sliders
            var sliders = [this.rSlider, this.gSlider, this.bSlider, this.aSlider]; 
            for(var i=0; i<4; i++){
                var slider = sliders[i];
                slider.setListener(function(color, per, init){
                    if(!init) //don't fire if the initialisation caused the event
                        t.setColor(color, this);
                });
            }
            
            //setup text input
            this.input.setListener(function(text){
                if(!text || text.length>0) t.setColor("black");
                if(text[0]=="#") t.setColor($Utils.getRGBA(hexToRgb(text)));
                else t.setColor($Utils.getRGBA(text));
            });
            
            //create templates
            var template;
            var selectTemplate = function(color){
                t.setColor(color);
            }
            this.colorTemplates = [];
            for(var i=defaultColors.length-1; i>=0; i--){
                template = new ColorTemplateElement(hexToRgb(settingColors[i].value), template, selectTemplate);
                this.$(".colorTemplates").prepend(template);
                this.colorTemplates.unshift(template);
                $(template).addClass(this.htmlClassName);
            }
            
            //add template
            this.$(".addTemplateButton").click(function(){
                t.$("c-color-template")[0].setColor(t.color);
                
                //shift all settings colors
                for(var i=defaultColors.length-1; i>0; i--){
                    settingColors[i].setValue(settingColors[i-1].value);
                }
                //add new setting color
                settingColors[0] = rgbToHex(t.color);
            });
            
            //create template listener functions
            this.templateListeners = [];
            for(var i=0; i<defaultColors.length; i++){
                (function(i){ //save variable i in a scope
                    t.templateListeners.push(function(){
                        t.colorTemplates[i].setColor(hexToRgb(settingColors[i].value), true);
                    });
                })(i);
            }
            
            this.setColor(this.color || hexToRgb(settingColors[0].value));
        }
        connectedCallback(){ //setup all settings listeners
            for(var i=0; i<defaultColors.length; i++){
                settingColors[i].addListener(this.templateListeners[i]);
            }
            this.setColor(this.color);
            console.log(this.color);
        }
        disconnectedCallback(){ //remove all settings listeners
            for(var i=0; i<defaultColors.length; i++){
                settingColors[i].removeListener(this.templateListeners[i]);
            }
        }
        setColor(color, ignoreSlider){
            if(!this.changingColor){
                this.changingColor = true; //prevent recursion
                
                //change rgba or hsv
                var rgbaSliders = [this.rSlider, this.gSlider, this.bSlider, this.aSlider];
                var hsvSliders = [this.svSlider, this.hSlider, this.aSlider];
                var changedRgba = rgbaSliders.indexOf(ignoreSlider)!=-1;
                var changedHsv = hsvSliders.indexOf(ignoreSlider)!=-1;
                
                var rgba = $Utils.getRGBA(color);
                var oldColor = this.color;
                this.color = rgba;
                //set rgba sliders
                for(var i=0; i<4; i++){ //go through sliders
                    var slider = rgbaSliders[i];
                    if(slider!=ignoreSlider){                
                        //set slider colors
                        var c1 = $Utils.copy(rgba);
                        c1[i] = 0;
                        var c2 = $Utils.copy(rgba);
                        c2[i] = 255;
                        slider.setGradient(c1, c2);
                        
                        //set slider value
                        if(changedRgba || (i==3 && changedHsv)) //don't change slider if rgba caused the color change, or slider is a and hsv caused it
                            continue;
                        slider.setPer((rgba[i]*rgba[i])/(255*255));
                    }
                }
                
                if(ignoreSlider==this.aSlider || ignoreSlider==null){ //set hue slider's colors if alpha changed
                    this.hSlider.setGradient(function(xPer, yPer){
                        var l = hueColors.length;
                        for(var i=0; i<l; i++){
                            if(yPer<=(i+1)/l){
                                var per = (yPer-i/l)/(1/l);
                                var c = $Utils.getColorPer(hueColors[i], hueColors[(i+1)%l], per);
                                c[3] = rgba[3];
                                return c;
                            }
                        }
                    });
                }
                
                //set hsv sliders
                var hsv = rgbToHsv(rgba, true);
                if(!changedHsv){        //don't change hsv sliders if they caused the change            
                    //set hue slider
                    if(!isNaN(hsv[0]))
                        this.hSlider.setPer(hsv[0]);
                    //set saturation and value sliders
                    this.svSlider.setPer(hsv[1], 1-hsv[2]);
                }
                
                //set preview color and hex
                this.preview.setColor(color);
                this.input.setValue(rgbToHex(rgba));
                
                if(this.listener && this.color.toString()!=oldColor.toString())
                    this.listener.call(this, $Utils.rgbaToCss(rgba), rgba);
                
                this.changingColor = false;
            }
        }
        setHue(per){
            this.hSlider.setPer(per);
        }
        
        //static methods
        static rgbToHsv(rgb){
            return rgbToHsv($Utils.getRGBA(rgb));
        }
        static hsvToRgb(rgb){
            return hsvToRgb();
        }
    };
    window.ColorPickerElementClass.registerElement();
})();