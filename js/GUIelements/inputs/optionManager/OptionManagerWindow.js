loadOnce("/window/Window");
loadOnce("OptionManagerOptionElement");
loadOnce("/styling/IconElement");
loadOnce("../../ScrollElement");
window.OptionManagerWindow = class OptionManagerWindow extends Window{
    constructor(){
        super();
    }
    //TODO fix indexes when removing element, make more generic index updating system
    __initVars(){
        super.__initVars();
        this.frameTemplate = {
            html:  `<div class='bg0 body'>
                        <div class=content>
                            _CONTENT_
                        </div>
                    </div>`,
            style: `.body{                            
                        width: fit-content;
                        height: fit-content;
                        position: relative;
                        
                        overflow: hidden;
                        
                        margin: 10px;
                        margin-top: 0px;
                        box-shadow: 0px 0px 10px 2px rgba(0,0,0,0.2);
                          -webkit-user-select: none;
                          -webkit-app-region: no-drag;
                          
                          min-width: 50px;
                          min-height: 10px;
                          
                          z-index: -1;
                    }
                    .pointer{
                        position: relative;
                        left: 50%;
                        width: 0px;
                        transform: translate(-50%, 0);
                        border-left-width: 20px;
                        border-right-width: 20px;
                        border-left-color: transparent;
                        border-right-color: transparent;
                        border-bottom-width: 10px;
                    }`
        };
        this.contentTemplate = {
            html:  `<div class=field>
                        <input type="text" class='inputField bg5 bd3 f0'
                        ><div class='dropDown bg2 bd3'>
                            <div class='arrow bd5'></div>
                        </div>
                    </div>
                    <c-scroll customAutoScroll class=options>
                        <div class=optionList></div>
                        <div class='addOption bg1 f0'>
                            <c-icon type=plus></c-icon>
                            Add
                        </div>
                    </c-scroll>`,
            style: `.field{
                        height: 24px;
                        line-height: 24px;
                        width: 100%;
                        display: inline-block;
                    }
                    .inputField{
                        width: calc(100% - 20px);
                        height: 100%;
                        line-height: 24px;
                        
                        display: inline-block;
                        vertical-align: top;
                        padding-left: 5px;
                        padding-right: 5px;
                        
                        outline: none;
                        overflow: hidden;
                        
                        box-sizing: border-box;
                        border-width: 1px;
                        border-right-width: 0px;
                    }
                    .dropDown{
                        width: 20px;
                        height: 100%;
                        display: inline-block;
                        vertical-align: top;
                        
                        box-sizing: border-box;
                        border-width: 1px;
                    }
                    .arrow{
                        border-top-width: 5px;
                        border-left-width: 6px;
                        border-right-width: 6px;
                        border-left-color: transparent;
                        border-right-color: transparent;
                        
                        width: 0px;
                        height: 0px;
                        position: relative;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                    }
                    c-scroll{
                        max-height: 100px;
                    }
                    c-scroll&c-icon{
                        height: 16px;
                        padding-left: 2px;
                    }
                    c-scroll&.addOption{
                        cursor: pointer;
                    }`
        };
    }
    __initHtml(){
        var t = this;
        //make sure the window changes size the element does
        this.$("c-scroll")[0].__onResize = function(){
            t.__updateSize();
        };
        
        //setup type event
        this.$(".inputField").keydown(function(e){
            if(e.keyCode==13){
                e.preventDefault();
                t.sendHide();
            }
            setTimeout(function(){
                var newName = this.$(".inputField").val();
                t.selectedElement.setOptionText(newName);    
                t.__sendRename(t.selected, newName);
            });
        }).css("font-family", this.$(".field").css("font-family") //fix the font that comes with an input field
        ).css("font-size", this.$(".field").css("font-size"));
        
        //create new option event
        this.$("c-scroll")[0].$(".addOption").click(function(){
            //create option
            var i=0;
            while(t.options[i]) i++;
            t.options.push(["new", i]);
            
            //create option element
            var index = t.options.length-1;
            var o = new OptionManagerOptionElement(index, t.options[index], t);
            $(o).insertBefore(t.$("c-scroll&.addOption"));
            
            //update window size
            t.$("c-scroll")[0].updateSize();
            
            //send and select option
            setTimeout(function(){                
                t.__sendCreate(t.options[index]);
                t.__selectOption(o);
            }, 0);
            
        });
    }
    __receiveSetWidth(width){
        this.content.width(width);
        this.__updateSize();
    }
    __receiveData(selected, options){
        this.options = options;
        
        var t = this;
        this.$("c-scroll&c-option-manager-option").remove();
        this.$("c-scroll")[0].setVerticalOffset(0); //reset position
        
        //set value
        this.$(".inputField").val(this.getOption(selected)[0]);
        this.selected = selected;
        
        //create children
        for(var i=0; i<options.length; i++){
            var o = new OptionManagerOptionElement(i, options[i], this);
            $(o).insertBefore(this.$("c-scroll&.addOption"));
            if(selected==options[i][1]){
                this.selectedElement = o;
                o.__select();
            }
        }

        //verify it is done
        setTimeout(function(){
            if(t.__sendDoneInit){
                t.__sendDoneInit();
            }                
        },10);
    }
    

    getOption(ID){
        return this.options.find(function(n){return n[1]==ID});
    }
    getOptionIndex(ID){
        return this.options.find(function(n){return n[1]==ID});
    }
    
    //pass through events called by OptionManagerOption, rename is done by this window itself using the inputField
    __selectOption(optionManagerOption){
        this.selectedElement.__deselect();
        optionManagerOption.__select();
        
        var o = optionManagerOption;
        this.$(".inputField").val(o.option[0]);
        this.selected = o.ID;
        this.selectedElement = o;
        this.__sendSelect(this.selected);
    }
    __deleteOption(optionManagerOption){
        this.__sendDelete(optionManagerOption.ID);
        this.__updateSize(); //update window size
    }
    __moveOption(optionManagerOption, oldIndex){
        this.__sendMove(oldIndex, optionManagerOption.ID);
    }
};