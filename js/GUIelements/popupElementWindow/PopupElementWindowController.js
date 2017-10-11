loadOnce("/window/WindowController");
window.PopupElementWindowController = class PopupElementWindowController extends WindowController{
    constructor(classPath, args, location){
        super(classPath, args);
        this.location = location;
        var t = this;
        this.window.on('blur', function(e){
            if(!t.dontHide){
                t.hide();
            }
        });
        
        //hide element when scrolling, as the new location will probably not line up (could also change into update the position when scrolling)
        this.scrollListener = function(){
            if(!t.dontHide){
                t.hide();
            }
        }
        $('html').on('mousewheel', this.scrollListener);
    }
    __initVars(){
        super.__initVars();
        this.windowArgs.skipTaskbar = true;
        this.dontHide = false;
    }
    
    //events that can be tapped into and altered
    __onHide(){}            //fires when the window hides when losing focus
    

    __alignWindow(){
        if(this.location){
            this.setPosition(this.location[0], this.location[1]);
        }else{
            return super.__alignWindow();
        }
    }
    show(x, y){
        this.hidden = false;
        this.setPosition(x, y);
        this.window.show();
    }
    hide(){               
        if(!this.hidden){            
            this.setPosition(-10000, -10000);
            this.hidden = true;
            this.__onHide();
        }
    }
    receiveHide(){
        this.hide();
    }
    setPosition(x, y){
        if(!this.hidden){            
            if(x===undefined){
                x = this.location[0];
                y = this.location[1];
            }else{            
                this.location[0] = x;
                this.location[1] = y;
            }
            
            var size = this.window.getSize();
            this.window.setPosition(Math.ceil(x-size[0]/2), Math.ceil(y));
        }
    }
    resize(width, height){
        super.resize(width, height);
        this.setPosition();
    }
    delete(){
        $('html').off('mousewheel', this.scrollListener);
    }
};