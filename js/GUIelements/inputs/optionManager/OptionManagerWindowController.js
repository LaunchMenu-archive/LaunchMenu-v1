loadOnce("../../popupElementWindow/PopupElementWindowController");
loadOnce("OptionManagerOptionElement");
window.OptionManagerWindowController = class OptionManagerWindowController extends PopupElementWindowController{
    constructor(){
        super("/GUIelements/inputs/OptionManager/OptionManagerWindow", [], [-10000, -10000]);
    }
    setOptionManager(optionManager){
        this.optionManager = optionManager;
        
        //send option data
        this.__sendData(optionManager.selected, optionManager.options);
        
        //set width
        this.__sendSetWidth($(optionManager).outerWidth());
    }
    __receiveDoneInit(){ //gets send after finishing setting up optionManager data
        var t = this;
        if(this.optionManager){
            setTimeout(function(){ //wait a bit, to make sure the resizing has been processed                
                //set position
                var om = $(t.optionManager);
                var offset = om.offset();
                $Window.sendGetPosition(function(pos){
                    t.windowPos = [pos[0], pos[1]];
                    //get the bottom center position of the element on the monitor
                    pos[0] += offset.left+om.outerWidth()/2;
                    pos[1] += offset.top;
                    
                    t.show(Math.ceil(pos[0]), Math.ceil(pos[1]));
                });
            },50);
        }
    }
    __onHide(){
        
    }
    __initVars(){
        super.__initVars();
//        this.dontHide = true;
        this.debug = false;
    }
    

    __updateWidthAndPosition(){
        this.__sendSetWidth($(this.optionManager).outerWidth());
        var om = $(this.optionManager);
        var offset = om.offset();
        this.setPosition(Math.ceil(this.windowPos[0]+offset.left+om.outerWidth()/2), 
                         Math.ceil(this.windowPos[1]+offset.top));
    }
    //pass through events called by OptionManagerWindow
    __receiveRename(ID, newName){
        this.optionManager.__renameOption(ID, newName);
        this.__updateWidthAndPosition();
    }
    __receiveMove(ID, newIndex){
        this.optionManager.__moveOption(ID, newIndex);
    }
    __receiveDelete(ID){
        this.optionManager.__deleteOption(ID);
    }
    __receiveSelect(ID){
        this.optionManager.__selectOption(ID);
        this.__updateWidthAndPosition();
    }
    __receiveCreate(text){
        this.optionManager.__createOption(text);
    }
};