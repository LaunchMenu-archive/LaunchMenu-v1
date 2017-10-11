/*global variables $, copy,*/
loadOnce("IconElement");
loadOnce("Style");
(function(){
    /* type(and customType) format:
     * styleName:{
     *      acronyms: [],                                        (Array of acronyms to also be as html class names)
     *      property: String,                                    (The css property of which to set the color)
     *      shades:   Number,                                    (The number of shades to generate)    
     *      addition: String,                                    (Any additional css that should go with the property)
     *      default: ["cssColor","cssColor"],                    (2 or 1 value array with css colors, to generate the shades from)
     *      settingData: {}                                        (Setting data connected to this gradient, same format as normal settings, to be used for customization)
     * }
     * 
     * example:
     *      border:{
     *          acronyms: ["bd"],
     *          property: "border-color",
     *          shades:   10,
     *          addition: "border-style:solid;border-width:0px;",
     *          default: ["#EEE", "#888"],
     *          settingData: {
     *              settingDisplayName: "element border"
     *          }
     *      }
     */
    const types = {
        background:{
            acronyms: ["bg"],
            property: "background-color",
            shades:   10,
            default: ["#FFF","#CCC"],
        },
        border:{
            acronyms: ["bd"],
            property: "border-color",
            shades:   10,
            addition: "border-style:solid;border-width:0px;", //the default display of a border (it should not show unless specified)
            default: ["#EEE", "#888"],
        },
        font:{
            acronyms: ["f"],
            property: "color",
            shades:   10,
            default: ["#000","#BBB"],
        },
        
        //special colors
        highlightBackground:{
            acronyms: [],
            property: "background-color",
            shades:   3,
            default: ["#00e9ff", "#8cf5ff"],
        },
        
        errorFont:{
            acronyms: [],
            property: "color",
            shades:   3,
            default: ["#9C0006","#FFC7CE"],
        },
        errorBorder:{
            acronyms: [],
            property: "border-color",
            shades:   3,
            addition: "border-style:solid;border-width:0px;",
            default: ["#9C0006","#FFC7CE"],
        },
        errorBackground:{
            acronyms: [],
            property: "background-color",
            shades:   3,
            default: ["#9C0006","#FFC7CE"],
        },
        
        warningFont:{
            acronyms: [],
            property: "color",
            shades:   3,
            default: ["#9C6500", "#FFEB9C"],
        },
        warningBorder:{
            acronyms: [],
            property: "border-color",
            shades:   3,
            addition: "border-style:solid;border-width:0px;",
            default: ["#9C6500", "#FFEB9C"],
        },
        warningBackground:{
            acronyms: [],
            property: "background-color",
            shades:   3,
            default: ["#9C6500", "#FFEB9C"],
        },
        
        successFont:{
            acronyms: [],
            property: "color",
            shades:   3,
            default: ["#006100","#C6EFCE"],
        },
        successBorder:{
            acronyms: [],
            property: "border-color",
            shades:   3,
            addition: "border-style:solid;border-width:0px;",
            default: ["#006100","#C6EFCE"],
        },
        successBackground:{
            acronyms: [],
            property: "background-color",
            shades:   3,
            default: ["#006100","#C6EFCE"],
        },
        
        infoFont:{
            acronyms: [],
            property: "color",
            shades:   3,
            default: ["#0000FF", "#9BD7FF"],
        },
        infoBorder:{
            acronyms: [],
            property: "border-color",
            shades:   3,
            addition: "border-style:solid;border-width:0px;",
            default: ["#0000FF", "#9BD7FF"],
        },
        infoBackground:{
            acronyms: [],
            property: "background-color",
            shades:   3,
            default: ["#0000FF", "#9BD7FF"],
        }
    };
    const hoverPostFixes = ["Hover","H"];
    const customTypes = {
        
    };
    
    var styles = [];
    var selectedStyle;
    var sh = {
        get styles(){
            return styles;
        },
        get types(){
            return $.extend({},types);
        },
        get customTypes(){
            return $.extend({},customTypes);
        },
        get allTypes(){
            return $.extend($.extend({},types), customTypes);
        },
        get hoverPostFixes(){
            return $.extend([], hoverPostFixes);
        },
        get selectedStyle(){
            return selectedStyle;
        },
        set SelectedStyle(style){
            style.enable();  
        },
    };
    window.$StyleHandler = sh;
    
    //a way for applets and icons to add specific gradients, if really needed. Preferably go with an existing gradient
    sh.registerCustomGradient = function(name, obj){
        if(customTypes[name]) return false;
            
        if(!obj.default) throw Error("A default color must be provided");
        
        //supplement object
        if(!obj.shades)
            obj.shades = 1;
        if(!(obj.default instanceof Array)){
            obj.shades = 1;
            obj.default = [obj.default, obj.default];
        }
        if(!obj.acronyms)
            obj.acronyms = [];
        
        //register element
        customTypes[name] = obj;
        
        //update all styles
        for(var i=0; i<styles.length; i++){
            var style = styles[i];
            if(style.__addCustomGradient)
                style.__addCustomGradient(name, obj);
        }
        return true;
    }
    sh.getType = function(typeName){
        if(types[typeName])
            return types[typeName];
        return customTypes[typeName];
    }
    sh.getStyle = function(ID){
        return styles.find(function(style){ return style.ID==ID; });
    }
    
    //style change methods 
    sh.baseStyle;
    sh.registerStyle = function(style){
        if(styles.length==0)
            style.enable();
        styles.push(style);
    };
    var lastTransitionTimeout;
    sh.selectStyle = function(style, alteredGradientName){
        selectedStyle = style;
        var oldColors = $("head").children("style.colors");
        //delete old transition
        $("head").children("style.colors.transition").remove();
        
        //stop old transition cleanup
        clearTimeout(lastTransitionTimeout);
        
        //cleanup after transition
        if($Settings.styling.general.useTransition.value)
            lastTransitionTimeout = setTimeout(function(){
                $("head").children("style.colors.transition").remove();
                oldColors.remove();
            }, $Settings.styling.general.transitionTime*1000);
        
        //set new colors and transition
        if($Settings.styling.general.useTransition.value)
            $("head").append(style.transitionStyle);
        $("head").append(style.style);
        
        //update icons
        if(window.IconElement)
            window.IconElement.updateIconsWithGradient(alteredGradientName);
    };
    
    //setup settings
    const alterStyleGroup = "alterStyle"
    $Settings.registerIgnoreGroup(alterStyleGroup);
    $Settings.styling.selectedTheme = {
        settingIndex: -1,
        defaultValue: {
            selected: {
                ID: 0
            },
            options: [
                ["light", 0]
            ]
        },
        type: "optionManager"
    };
    $Settings.styling.showCustomColors = {
        settingDisplayName: "show specific colors",
        settingIndex: 1000, 
        settingSpacing: true,
        defaultValue: false
    };
    $Settings.styling.general.useTransition = {
        defaultValue: true,
        settingIndex: 0 
    };
    $Settings.styling.general.transitionTime = {
        defaultValue: 2,
        validations:{
            min: 0
        },
        settingIndex: 1,
        settingDisplayName: "transition duration",
        settingVisibilityCheck:{
            settings: ["styling.general.useTransition"],
            func: function(useTransition){ return useTransition }
        }
    };
    
    //handle style switching, creation and deletion
    $Settings.styling.selectedTheme.addListener(function(newValue, oldValue, changes){
        if(changes){
            if(changes[0]=="create"){
                var ID = changes[1][1];
                $Settings.setGroup(alterStyleGroup, ID); //let every window create its own styling instead of forwarding it
                sh.registerStyle(new Style($Settings.styling[ID]));
                $Settings.setGroup(null);
            }else if(changes[0]=="select"){
                var style = sh.getStyle(changes[1][1]);
                if(style)
                    style.enable();
            }else if(changes[0]=="delete"){
                var ID = changes[1][1];
                var style = sh.getStyle(ID);
                if(style){
                    $Settings.setGroup(alterStyleGroup, ID); //let every window create its own styling instead of forwarding it
                    style.delete();
                    $Settings.setGroup(null);
                }
            }
        }
    });
    
    //create selected style from settings
    var selected = $Settings.styling.selectedTheme.value.selected
    sh.registerStyle(new Style($Settings.styling[selected.ID]));
    
    
    //create other styles from settings
    var options =  $Settings.styling.selectedTheme.value.options;
    for(var option of $Settings.styling.selectedTheme.value.options)
        if(option[1]!=selected.ID)
            sh.registerStyle(new Style($Settings.styling[option[1]]));
})();