loadOnce("/communication/$CommunicationUtils");
loadOnce("/settings/Setting");
window.Shortcut = (function(){
    const ctrl = "ctrl";
    const shift = "shift";
    const alt = "alt";
    const connector = "+";
    const spacer = ", ";
    
    const specialKeys = {ctrlKey:"ctrl", shiftKey:"shift", altKey:"alt"};
    const specialKeyNames = ["control","shift","alt"];
    
    const Shortcut = class Shortcut{
        constructor(shortcut){
            this.shortcut = shortcut||"";
            var shortcutList = this.shortcut.split(spacer);
            this.shortcutCount = shortcutList.length;
            if(shortcutList[0].length==0) this.shortcutCount--;
        }
        [$CommunicationUtils.encodeSymbol](){
            return ["/Shortcut", [this.shortcut]];
        }
        [Setting.getSymbol("updateSetting")](updateFunc){
            this.updateSetting = updateFunc;
        }
        
        setLastShortcut(keyEvent){
            var shortcutList = this.shortcut.split(spacer);
            if(shortcutList.length > this.shortcutCount)
                shortcutList.pop();
            
            if(typeof keyEvent == "string"){            //add shortcut string
                shortcutList.push(keyEvent);
            }else{                                      //add shortcut event
                var output = Shortcut.getString(keyEvent);
                
                //reconstruct shortcut
                shortcutList.push(output);
            }
            this.shortcut = shortcutList.join(spacer);
            
            //send changes if part of setting
            if(this.updateSetting) this.updateSetting();
            return this.shortcut;
        }
        addShortcut(keyEvent){
            //add a new shortcut if defined, otherwise just make the last shortcut final
            if(keyEvent)
                this.setLastShortcut(keyEvent);
            var shortcutList = this.shortcut.split(spacer);
            
            //remove double occurrences
            for(var i=shortcutList.length-1; i>=0; i--){
                var shortcut = shortcutList[i];
                if(shortcutList.indexOf(shortcut)!=i)
                    shortcutList.splice(i, 1);
            }

            //remove unfinished shortcuts
            var last = shortcutList[shortcutList.length-1];
            if(last[last.length-1]==connector) shortcutList.pop();
            
            this.shortcut = shortcutList.join(spacer);
            
            //update shortcut count
            this.shortcutCount = shortcutList.length;
            if(shortcutList.length>0 && shortcutList[0].length==0) 
                this.shortcutCount--;
            
            //send changes if part of setting
            if(this.updateSetting) this.updateSetting();
            return this.shortcut;
        }
        removeShortcut(){
            //remove shortcut
            var shortcutList = this.shortcut.split(spacer);
            shortcutList.pop();
            
            //join shortcuts again
            this.shortcut = shortcutList.join(spacer);
            
            //update shortcut count
            this.shortcutCount = shortcutList.length;
            if(shortcutList.length>0 && shortcutList[0].length==0) this.shortcutCount--;

            //send changes if part of setting
            if(this.updateSetting) this.updateSetting();
            return this.shortcut;
        }
        
        test(keyEvent){
           return Shortcut.test(this.shortcut, keyEvent);
        }
        
        //static functions
        static test(shortcutsString, keyEvent){
            s:
            for(var shortcut of shortcutsString.split(spacer)){ //go through shortcuts
                shortcut = shortcut.toLowerCase();
                
                //don't trigger if the pressed key is a modifier key
                if(specialKeyNames.indexOf(keyEvent.key.toLowerCase())!=-1)
                    continue s;
                
                //don't trigger if the shortcut is half finished
                if(shortcut[shortcut.length-1]==connector)
                    continue s;
                    
                var specialKeys = {ctrlKey:ctrl, shiftKey:shift, altKey:alt};
                var keyNames = Object.keys(specialKeys);
                
                //check if all the special keys are pressed
                for(var i=0; i<keyNames.length; i++){
                    var name = keyNames[i];
                    var index = shortcut.indexOf(specialKeys[name]);
                    if(!!keyEvent[name] != (index!=-1)) 
                        continue s;
                }
                
                //check if the right key is pressed
                var parts = shortcut.split(connector);
                if(parts.indexOf(keyEvent.key.toLowerCase())==-1) continue s;
                
                return true;
            }
            return false;
        }
        static getString(keyEvent){
            var keyNames = Object.keys(specialKeys);
            var output = "";
            //add all modifier keys
            for(var i=0; i<keyNames.length; i++){
                var name = keyNames[i];
                if(keyEvent[name]) 
                    output+=specialKeys[name]+connector;
            }
            
            //check if the key is not a special key
            if(specialKeyNames.indexOf(keyEvent.key.toLowerCase())==-1)
                output += keyEvent.key.toLowerCase();
            
            return output;
        }
    }
    return Shortcut;
})();