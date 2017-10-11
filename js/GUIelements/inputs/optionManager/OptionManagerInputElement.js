loadOnce("../../BaseElement");
loadOnce("OptionManagerWindowController");
window.OptionManagerInputElementClass = class OptionManagerInputElementClass extends BaseElementClass{
    constructor(options, selectedID, listener){
        super(function(){
            this.options = [];
        });
        
        //setup options
        if(options){
            this.options = options;
            //make sure all options have an identifier
            for(var i=0; i<this.options.length; i++){
                var option = this.options[i];
                if(!option instanceof Array){
                    var j = 0;
                    while(this.options[j]) j++;
                    this.options[i] = [option, j];
                }
            }
        }
        if(selectedID!==null && selectedID!==undefined){
            this.selected = selectedID;
        }
        
        this.listener = listener;
        
        this.$(".inputField").text(this.getSelected()[0]);
        if(!window.optionManager){
            window.optionManager = new OptionManagerWindowController();
        }
    }
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<div class='inputField bg5 bd3 f0'></div
                    ><div class='dropDown bg2 bd3'>
                        <div class='arrow bd5'></div>
                    </div>`,
            style: `.root{
                        height: 24px;
                        line-height: 24px;
                        min-width: 120px;
                        display: inline-block;
                        cursor: pointer
                    }
                    .inputField{
                        width: calc(100% - 20px);
                        height: 100%;
                        display: inline-block;
                        vertical-align: top;
                        padding-left: 5px;
                        padding-right: 5px;
                        
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
                    }`
        }
    }
    __initHtml(){
        super.__initHtml();
        var t = this;
        $(this).click(function(){
            var om = window.optionManager;
            if(om){ //there should always be a option manager, otherwise something went quite wrong
                om.setOptionManager(t);
            }
        })
    }
    __setupChildElement(child){
        //create the list of options from the child elements
        if(child[0].nodeName!="#text"){            
            var childContent = child.html();
            this.options.push([childContent, this.options.length]);
            if(child.attr("selected"))
                this.selected = this.options.length-1;
        }
    }
    
    getSelected(){
        var t = this;
        return this.options.find(function(n){return n[1]==t.selected});
    }
    getSelectedIndex(){
        var t = this;
        return this.options.findIndex(function(n){return n[1]==t.selected});
    }
    getOption(ID){
        return this.options.find(function(n){return n[1]==ID});
    }
    getOptionIndex(ID){
        return this.options.findIndex(function(n){return n[1]==ID});
    }
    
    setListener(listener){
        this.listener = listener;
    }
    setData(options, selectedID){
        this.selected = this.options.findIndex(function(n){return n[1]==selectedID});
        this.options = options;
        this.$(".inputField").html(this.options[this.selected][0]);
        
        window.optionManager.hide();
    }
    
    //pass through events called by OptionManagerWindowController
    __renameOption(ID, newName){
        var option = this.getOption(ID);
        var oldName = option[0]; 
        option[0] = newName;
        if(ID == this.selected)
            this.$(".inputField").html(newName);
        
        if(this.listener)
            this.listener.call(this, "rename", option, newName, oldName);
    }
    __deleteOption(ID){
        var option = this.getOption(ID);
        this.options.splice(this.getOptionIndex(ID), 1);
        
        if(this.listener)
            this.listener.call(this, "delete", option);
    }
    __selectOption(ID){
        this.selected = ID;
        this.$(".inputField").html(this.getOption(ID)[0]);
        
        if(this.listener)
            this.listener.call(this, "select", this.getOption(ID));
    }
    __moveOption(ID, newIndex){
        var option = this.getOption(ID);
        
        var oldIndex = this.getOptionIndex(ID);
        this.options.splice(oldIndex, 1);
        this.options.splice(newIndex, 0, option);
        
        if(this.listener)
            this.listener.call(this, "move", option, newIndex, oldIndex);
    }
    __createOption(option){
        this.options.push(option);
        
        if(this.listener)
            this.listener.call(this, "create", this.options[this.options.length-1]);
    }
};
window.OptionManagerInputElementClass.registerElement();