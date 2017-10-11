/*global variables Class, $PreviewHandler, Actions, $Utils, $EventHandler*/
loadOnce("$PreviewHandler");
loadOnce("/$Utils");
loadOnce("/$EventHandler");
loadOnce("/communication/serverCommunication");
window.Preview = class Preview{    
    constructor(){
        this.__initVars();
        
        //create element out of template
        var n = $Utils.createTemplateElement(this.constructor.name, this.template);
        this.element = n.element;
        this.element.css({width:"100%",height:"100%",display:"none"});
        this.$ = n.querier;
        this.htmlClassName = n.htmlClassName;
    }
    __initVars(){
        //vars that could be overriden to change behaviour
        
        this.extensions = [];
        this.template = {
            html: "",
            style:""
        };
        this.showGeneralData = true;
    }

    //events that can be tapped into and altered
    __onLoadFile(file){}                                    //fires to display a file
    __initHtml(){}                             //fires to initialize html, if required
    __onDatesLoad(created, modified, accessed){}        //fires when the dates are loaded in order to do something with them, if required
    __onSizeLoad(size, formattedSize){}                       //fires when the size is loaded in order to do something with them, if required
    __resetFile(){}                                           //fires to reset the loaded file to cleanup after it, 
                                                        //mainly meant for when loading the next file can take some time,
                                                        //and you want to at least remove the old file from showing still
    
    //the actual file loading methods
    loadFile(file){
        if($EventHandler.trigger("openFile:pre", this, {newFile:file, file:this.file})){
            this.__resetFile();
            this.file = file;
            if(this.showGeneralData){
                this.__setGeneralData();   
                $PreviewHandler.showGeneralData();
            }else{
                $PreviewHandler.hideGeneralData();
            }
            
            var open = this.open();
            this.__onLoadFile(file);
            
            if(!open)
                return false;
                
            $EventHandler.trigger("openFile:post", this, {file:file});
            return true;
        }
        return false;
    }
    __setGeneralData(){
        var file = this.file;
        var path = file.getPath();
        var t = this;
        
        $PreviewHandler.setGeneralData(null, null, null, null, path);       
        Actions.file.getDates(path, function(dates){
            if(dates){
                if(t.file == file){
                    $PreviewHandler.setGeneralData(null, dates.dateCreated, dates.dateModified, dates.dateAccessed, null);
                    t.__onDatesLoad(dates.dateCreated, dates.dateModified, dates.dateAccessed);
                }
            }
        });
        Actions.file.getSize(path, function(size){
            if(size){
                var ar = [[1, " Bit", "s"], [8, " Byte", "s"], [1024, "KB"], [1024, "MB"], [1024, "GB"]];
                var formattedSize = "0 Bits";
                for(var i=0; i<ar.length; i++){
                    if(size>=ar[i][0]){
                        size = Math.round(size/ar[i][0]);
                        formattedSize = size+ar[i][1]+(size.length!=1&&ar[i][2]?ar[i][2]:"");
                    }else
                        break;
                
                }
                if(t.file == file){
                    $PreviewHandler.setGeneralData(formattedSize, null, null, null, null);
                    t.__onSizeLoad(size, formattedSize);
                }
            }
        });
    }
    
    //visibility methods
    open(){
        if($EventHandler.trigger("open:pre", this, {file:this.file})){
            if($PreviewHandler.__setOpenedPreview(this)){
                this.element.show();
                $EventHandler.trigger("open:post", this, {file:this.file});
                return true;
            }
        }
        return false;
    }
    close(){
        if($EventHandler.trigger("close:pre", this, {file:this.file})){
            this.element.hide();
            $EventHandler.trigger("close:post", this, {file:this.file});
            return true;
        }
        return false;
    }
}
