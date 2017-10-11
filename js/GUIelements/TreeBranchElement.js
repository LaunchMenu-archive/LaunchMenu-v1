loadOnce("/GUIelements/BaseElement");
window.TreeBranchElementClass = class TreeBranchElementClass extends BaseElementClass{
    constructor(name){
        super();
        
        this.$(".title").text(name||this.attr.name);
        if(this.image){
            var icon = this.$(".icon");
            icon.css("background-image", "url('"+this.image+"')");
            var h = 13;
            icon.width(h).height(h);
        }else if(this.icon){
            var icon = this.$(".icon");
            icon.addClass("icoMoon").addClass("icon-"+this.icon);
        }
    }
    __initVars(){
        super.__initVars();
        this.icon = "folder";
        this.image = null; //set to image url to use an image
        this.transitionTime = 200;
        this.resizeHorizontal = true; //if the element should also change its width when hiding its content
        this.type = TreeBranchElement;
        this.template = {
            html: `    <div class='header f0'>
                        <div class=headerInner>
                            <div class='highlight bg4 bd3'></div>
                            <div class='arrow bd8'></div
                            ><div class='icon'></div
                            ><div class=title>[title placeholder]</div>
                        </div>
                    </div>
                    <div class=content>
                        <div class=contentInner>
                            _CHILDREN_
                        </div>
                    </div>`,
            style: `.root{
                        width: fit-content;
                        min-width: 100%;
                        display: block;
                    }
                    .header{ 
                        white-space: nowrap;
                        height: 18px;
                        cursor: pointer;
                    }    
                        .headerInner{
                            width: fit-content;
//                            min-width: 100%;
                            height: 100%;
                            position: relative;
                        }
                        .highlight{
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: -400px;
                            right: -400px;
                            z-index: -1;
                            border-width: 1px;
                            display: none;
                        }
                        .arrow{
                            width: 0px;
                            height: 0px;
                            display: inline-block;
                            vertical-align: top;
                            
                            position: relative;
                            top: 50%;
                            transform: translate(0, -50%);
                            
                            border-width: 0px;
                            border-top-width: 5px;
                            border-bottom-width: 5px;
                            border-left-width: 10px;
                            border-top-color: transparent;
                            border-bottom-color: transparent;
                            transition: transform `+this.transitionTime+`ms;
                        }
                        .opened>.header>.headerInner>.arrow{
                            transform: translate(0, -50%) rotate(90deg);
                            transition: transform `+this.transitionTime+`ms;
                        }
                        .icon{
                            margin-left: 3px;
                            display: inline-block;
                            vertical-align: middle;
                            font-size: 13px;
                            
                            position: relative;
                            top: 50%;
                            transform: translate(0,-50%);
                            
                            background-size: cover;
                            background-repeat: no-repeat;
                            background-position: center center;
                        }
                        .title{
                            margin-left: 3px;
                            display: inline-block;
                            vertical-align: top;
                            margin-right: 5px;
                        }
                    .content{
                        width: fit-content;
                        min-width: 100%;
                        height: 0px;
                        /*instead of overflow hidden, use clip-path*/
                        /*which allows overflow on the left to be visible (for background highlighting)*/
                        clip-path: polygon(-200px 0px, calc(100% + 5px) 0px, calc(100% + 5px) 100%, -200px 100%);
                        `+(this.resizeHorizontal?"width: 0px;":"")+`
                    }
                        .contentInner{
                            width: fit-content;
                            margin-left: 13px;
                            min-width: calc(100% - 13px);
                        }`
        }
    }
    __initHtml(){
        var t = this;
        this.$(".header").click(function(){
            t.toggle();
        });
    }
    
    //select/deselect methods
    __getParent(){
        var p = $(this).parents("._QUERYNODE_")[0];
        if(p.type==this.type) return p;
        
        return $(this).parent()[0];
    }
    __getChildren(){
        return this.$(".contentInner").children();
    }
    select(){
        $(this).addClass("newSelected");
        //deselect currently selected category
        var root = this;
        do{
            root = root.__getParent();            
        }while(root.type==this.type)
        $(root).children().each(function(){
            if(this.deselect)
                this.deselect();
        });
        
        //select this element
        $(this).removeClass("newSelected");
        $(this).addClass("selected");
        this.$(".highlight").show();
        this.selected = true;
    }
    deselect(){
        //deselect all children (for if they any of them is selected)
        var children = this.__getChildren();
        for(var i=0; i<children.length; i++){
            var child = children[i];
            if(child.deselect)
                child.deselect();
        }
        
        //deselect itself
        if(this.selected){
            this.selected = false;
            this.$(".highlight").hide();
            $(this).removeClass("selected");
        }
    }
    
    //methods to open/close the branch
    isOpen(){
        return $(this).is(".opened");
    }
    __resizeStep(per){
        var c = this.$(".content");
        //height change
        c.height(this.$(".contentInner").height() * per) //set height to percentage of content height

        //width change
        if(this.resizeHorizontal){
            var headerWidth = this.$(".headerInner").width();
            var contentWidth = this.$(".contentInner").width()+parseInt(this.$(".contentInner").css("margin-left"));
            
            var delta = Math.max(0,contentWidth-headerWidth);
            c.outerWidth(headerWidth + delta*per);
        }
        
        //code to force a repain, because the clip-path doesn't show its changes otherwise due to a bug
        c.hide().outerHeight();
        c.show();
    }
    toggle(){
        if(this.isOpen())    this.close();
        else                this.open();
    }
    open(){
        var t = this;
        $(this).addClass("opened")
        
        //animate the content height and width change
        if(this.an) this.an.stop(true) //stop previousAnimation
        this.an = $({per:0});
        this.an.animate({per:1}, {duration:this.transitionTime, step: function(now){
            t.__resizeStep(now);
        },complete:function(){ //animate the height
            var content = t.$(".content");
            content.height("auto"); //set the height to auto afterwards, so it can adjust as the contents change
            
            if(t.resizeHorizontal){
                content.width("auto"); //set the width to auto afterwards, so it can adjust as the contents change
            }
        }});
    }
    close(){
        var t = this;
        $(this).removeClass("opened");
        
        //animate the content height and width change
        if(this.an) this.an.stop(true) //stop previousAnimation
        this.an = $({per:1});
        this.an.animate({per:0}, {duration:this.transitionTime, step: function(now){
            t.__resizeStep(now);
        }});
    }
}
window.TreeBranchElementClass.registerElement();