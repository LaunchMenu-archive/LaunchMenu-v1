/*global variables $, copy,*/
window.$StyleHandler = (function(){
    var types = {
        background:{
            acronyms: ["bg"],
            property: "background-color",
            shades:   10,
        },
        border:{
            acronyms: ["bd"],
            property: "border-color",
            shades:   10,
            addition: "border-style:solid;border-width:0px;" //the default display of a border (it should not show unless specified)
        },
        font:{
            acronyms: ["f"],
            property: "color",
            shades:   10,
        },
        fontError:{
            acronyms: [],
            property: "color",
            shades:   3,
        },
        backgroundHighlight:{
            acronyms: [],
            property: "background-color",
            shades:   3,
        }
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
        get selectedStyle(){
            return selectedStyle;
        },
        set SelectedStyle(style){
            style.enable();  
        },
    };
    
        
    sh.transitionDuration = 2;
    sh.baseStyle;
    sh.registerStyle = function(styleClass){
    	var style = new styleClass();
        if(styles.length==0){
            this.baseStyle = style;
            style.enable();
        }
        styles.push(style);
    };
    sh.selectStyle = function(style){
        selectedStyle = style;
        var oldColors = $("head").children("style.colors"); 
        $("head").append(style.transitionStyle);
        setTimeout(function(){
            $("head").children("style.colors.transition").remove();
        	oldColors.remove();
        },sh.transitionDuration*1000);
        $("head").append(style.style);
    };
    
    return sh;
})();