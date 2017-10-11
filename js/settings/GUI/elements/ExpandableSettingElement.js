loadOnce("BaseSettingElement");
window.ExpandableSettingElementClass = class ExpandableSettingElementClass extends BaseSettingElementClass{
    constructor(setting, invalidValueFunc, helpMessageFunc, container, preInitFunc){ //preInitFunc is intended to be used when extending this class, not as an external argument
        super(setting, invalidValueFunc, helpMessageFunc, container, function(){
            this.template.html = this.template.html.replace("_EXPANDABLECONTENT_",   this.expandableTemplate.html);
            this.template.style += this.expandableTemplate.style;

            if(preInitFunc)
                preInitFunc.call(this);
        });
    }
    __initVars(){
        super.__initVars();

        this.template = { //modified version of the BaseSettingElement's template
            html: `<div class='container f0 bg0 bd0'>
                        <div class='disabledOverlay bg4'></div>
                        <div class=containerInner>
                            <div class=title></div>
                            <div class=value>
                                _VALUE_
                            </div>
                        </div>
                        <div class=expandable>
                            _EXPANDABLECONTENT_
                        </div>
                   </div>`,
            style: `.root{
                        margin-top: -1px; /*make bottom and top borders of settings overlap*/
                        width: fit-content;
                        min-width: 100%;
                    }
                    .container{
                        border-width: 1px;
                        padding: 5px;
                        box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
                        overflow: hidden;
                        height: 0px;
                        
                        width: fit-content;
                        min-width: calc(100% - 12px); /*subtract padding and border*/
                    }
                    .containerInner{
                        display: flex;
                        
                        width: fit-content;
                        min-width: 100%;
                        min-height: 17px;
                    }
                    .title{
                        margin-right: 5px;
                        flex: 1; //take up all available space, so the value appears on the right
                    }
                    .disabled .disabledOverlay{
                        display: block;
                    }
                    .disabledOverlay{
                        display: none;
                        
                        cursor: not-allowed;
                        opacity: 0.5;
                        
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                    }
                    .expandable{
                        margin-top: 5px;
                    }`
        };
        
        this.expandableTemplate = {
            html:  ``,
            style: ``
        };
        
        this.transitionDuration = 200;
    }
    connectedCallback(){
        super.connectedCallback();
        this.expanded = true;
        
        $(this).show(); //make sure the element has the proper height when being collapsed
        this.collapse(true);
        this.updateVisibility(); //undo the .show method
    }

    __setToTrueWidth(val){//overwrite setToTrue width because the structure has been altered
        if(val){
            this.$(".title").css("flex", "0");
            this.$(".container").css("min-width", "auto");
            this.$(".containerInner").css("min-width", "auto");
        }else{
            this.$(".title").css("flex", "");
            this.$(".container").css("min-width", "");
            this.$(".containerInner").css("min-width", "");
        }
    }
    
    expand(instant){
        if(!this.expanded){
            this.expanded = true;
            
            //find out what the height should be
            var c = this.$(".container");
            var oldHeight = c.height();
            c.height("auto");
            var newHeight = c.height();
            
            //create transition to that height
            c.height(oldHeight).animate({"height": newHeight}, instant?0:this.transitionDuration);
        }
    }
    isExpanded(){
        return this.expanded;
    }
    collapse(instant){
        if(this.expanded){
            this.expanded = false;
            this.$(".container").animate({"height": this.$(".containerInner").outerHeight(true)}, instant?0:this.transitionDuration);
        }
    }
    toggle(){
        if(this.isExpanded())
            this.collapse();
        else
            this.expand();
    }
    
};