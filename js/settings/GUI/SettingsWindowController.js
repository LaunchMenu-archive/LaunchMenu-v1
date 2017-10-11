loadOnce("/window/WindowController");
window.SettingsWindowController = class SettingsWindowController extends WindowController{
    constructor(){
        super();
    }
    __initVars(){
        super.__initVars();
        this.windowClass = "/settings/GUI/SettingsWindow"; 
        this.windowArgs.title = "Settings";
        this.windowArgs.resizable = true;
        
        //use custom sizing limit code
        this.windowArgs.maxSize = null; 
        this.windowArgs.minSize = null;
    }
};