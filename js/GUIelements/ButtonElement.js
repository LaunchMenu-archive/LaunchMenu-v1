loadOnce("BaseElement");
window.ButtonElementClass = class ButtonElementClass extends BaseElementClass{
    constructor(text, listener){
        super();
        this.listener = listener;
        if(typeof text=="string") 
            text = "<div>"+text+"</div>";
        this.$(".button").append($(text));
    }
    __initVars(){
        super.__initVars();
        this.template = {
            html:  `<div class='button bg5'>
                        _CHILDREN_
                    </div>`,
            style: `.button{
                        position: relative;
                        cursor: pointer;
                        
                        padding: 5px;
                        padding-top: 2px;
                        padding-bottom: 2px;
                        
                        box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
                        user-select: none;
                        text-align: center;
                    }`
        }
    }
    __initHtml(){
        super.__initHtml();
        var t = this;
        $(this).mousedown(function(){
            this.$(".button").removeClass("bg5").addClass("bg2").css({"box-shadow":"none", "top":"1px"});
        }).mouseup(function(){
            this.$(".button").removeClass("bg2").addClass("bg5").css({"box-shadow":"", "top":"0px"});
        });
        $(this).click(function(){
            if(t.listener)
                t.listener.call(this);
        });
    }
};
window.ButtonElementClass.registerElement();