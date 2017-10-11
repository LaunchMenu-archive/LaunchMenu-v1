loadOnce("/$Utils");
loadOnce("$StyleHandler");
window.Style = class Style{
    constructor(setting){
        this.setting = setting;
        this.ID = setting[Setting.getSymbol("name")];
        this.styleElements = {};        //the styling with gradientNames as keys
        this.transitionSelectors = [];  //a list of transition selectors, grouped by gradients
        this.colors = {}                //a map of the computed colors by html classname
        this.__setupSetting();
        
        var t = this;
        this.transitionTimeChangeListener = function(){
            t.__assembleStyling();
        }
        $Settings.styling.general.transitionTime.addListener(this.transitionTimeChangeListener);
    }

    __setupSetting(){
        var t = this;
        var s = this.setting;
        if(s._categoryPushSettings===undefined) s._categoryPushSettings = true;
        if(s._categoryInvisible===undefined)    s._categoryInvisible = true;
        
        //setup gradients
        var types = $StyleHandler.types;
        var names = Object.keys(types);
        for(var i=0; i<names.length; i++){
            var gradientName = names[i];
            var type = types[gradientName];
            this.__createGradient(gradientName, type, i);
        }
        
        //setup custom gradients
        var customTypes = $StyleHandler.customTypes;
        var names = Object.keys(customTypes);
        for(var i=0; i<names.length; i++){
            var gradientName = names[i];
            var type = customTypes[gradientName];
            this.__createGradient(gradientName, type, null, true);
        }
        
        //assemble style
        this.__assembleStyling();
    }
    __createGradient(gradientName, type, guiIndex, customGradient){
        var s = this.setting;
        var t = this;
        
        //create setting
        if(s[gradientName]._shades===undefined)                                 s[gradientName]._shades = type.shades;
        if(s[gradientName]._type===undefined)                                   s[gradientName]._type = "styleGradient";
        if(s[gradientName]._defaultValue===undefined)                           s[gradientName]._defaultValue = {gradient: $Utils.copy(type.default)};
        if(s[gradientName]._settingIndex===undefined && guiIndex!=undefined)    s[gradientName]._settingIndex = guiIndex;

        //add visibility check, so the setting is only visible when needed
        if(s[gradientName]._settingVisibilityCheck===undefined){
            var settings = ["styling.selectedTheme"];
            if(customGradient) settings.push("styling.showCustomColors");             //custom gradient behaviour; make them hideable with the showCustomColors setting
            s[gradientName]._settingVisibilityCheck = {
                settings: settings,
                func: function(selectedTheme, customColors){ return selectedTheme.selected.ID==this[Setting.getSymbol("parent")][Setting.getSymbol("name")] && customColors!==false; } //hide color if not part of selected style
            }
        }
        
        //setup gradient styling
        s[gradientName].addListener(function(newValue){
            t.__createCssGradientShades(gradientName, s[gradientName].value);
            t.__assembleStyling();
            t.__updateStyling(gradientName);
        });
        this.__createCssGradientShades(gradientName, s[gradientName].value);
        

        //set custom setting data if defined
        if(type.settingData){
            s[gradientName] = type.settingData; 
        }
        
        
        //create transition styling
        var selector = "";
        for(var j=0; j<type.shades; j++){
            selector += ","+this.__createGradientShadeSelector(gradientName, j);
        }
        this.transitionSelectors.push(selector);
    }
    __assembleStyling(){
        //create styling
        this.style = "";
        for(var styleElement of Object.values(this.styleElements)){
            this.style += styleElement; 
        }
        this.style = "<style class='colors "+this.ID+"'>\n"+this.style+"</style>";
        
        //create transition styling
        this.transitionStyle = "";
        for(var selector of this.transitionSelectors){
            this.transitionStyle += selector;
        }
        this.transitionStyle = this.transitionStyle.substring(1)+`{
            transition: all ${$Settings.styling.general.transitionTime}s ease;
            transition-property: color, background-color, border-color;
        }`;
        this.transitionStyle = "<style class='colors transition "+this.ID+"'>\n"+this.transitionStyle+"</style>";
    }
    __updateStyling(alteredGradientName){
        if($StyleHandler.selectedStyle==this)
            $StyleHandler.selectStyle(this, alteredGradientName);
    }
    __createCssGradientShades(typeName, value){
//        console.log(value);
        var type = $StyleHandler.getType(typeName);
        var startColor = $Utils.getRGBA(value.gradient[0]);
        var endColor = $Utils.getRGBA(value.gradient[1]);
        
        var output = "";
        
        //loop through all shades
        for(var i=0; i<type.shades; i++){
            //get color
            var color;
            if(value[i]){
                color = value[i]; 
            }else{
                color = $Utils.rgbaToCss($Utils.getColorPer(startColor, endColor, i/Math.max(1, type.shades-1)));
            }
            
            //create style
            var styling = this.__createGradientShadeSelector(typeName, i)+"{"+type.property+":"+color+";"+(type.addition?type.addition:"")+"}\n";
            output += styling;
            
            //store the value in the color map
            this.colors[typeName+i] = $Utils.getRGBA(color);
        }
        
        //add styling
        this.styleElements[typeName] = output;
    }
    __addCustomGradient(name, object){
        this.__createGradient(name, object, null, true);
    }
    __createGradientShadeSelector(typeName, shadeIndex){
        var type = $StyleHandler.getType(typeName);
        var selectors = [typeName].concat(type.acronyms);
        var hovers = $StyleHandler.hoverPostFixes;
        
        var selectorString = "";
        //go through all selectors
        for(var i=0; i<selectors.length; i++){
            var selector = "."+selectors[i]+shadeIndex;
            selectorString += ","+selector;
            //add hover selectors
            for(var j=0; j<hovers.length; j++){
                selectorString += ","+selector+hovers[j]+":hover";
            }
        }
        return selectorString.substring(1);
    }
    delete(){
        this.setting.delete();
        $Settings.styling.general.transitionTime.removeListener(this.transitionTimeChangeListener);
    }
    
    enable(){
        $StyleHandler.selectStyle(this);
    }
    disable(){
        if($StyleHandler.selectedStyle==this)
            $StyleHandler.baseStyle.enable(); //overwrite the current style
    }
}