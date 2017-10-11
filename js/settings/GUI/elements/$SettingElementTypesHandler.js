window.$SettingElementTypesHandler = (function(){
    var seth = {
        get elementClassList(){
            return elementClassList;    
        }
    };
    
    var elementClassList = [];
    seth.registerElementClass = function(elementClass){
        elementClassList.unshift(elementClass);
    };
    seth.getElementClass = function(setting){
        var c = null;
        if(setting._GUIclass){
            if($Setting._GUIclass instanceof Function){
                c = setting._GUIclass; 
            }else{
                c = setting._GUIclass.class;
            }
        }else{
            var bestMatch = null;
            for(var i=0; i<elementClassList.length; i++){
                var elementClass = elementClassList[i];
                if(elementClass.matchesSetting){
                    var match = elementClass.matchesSetting(setting);
                    if(match>0 && (!bestMatch || match>bestMatch.score)){
                        bestMatch = {
                            score: match,
                            elementClass: elementClass
                        }
                    }
                }
            }
            if(bestMatch)
                c = bestMatch.elementClass;
        }
        
        if(!c)
            c = DefaultSettingElementClass;
        
        return c.registerElement(false);
    }
    
    return seth;
})();
$ScriptLoader.loadDir("settingElementTypes/");
$ScriptLoader.loadDir("GUIelementTypes/");