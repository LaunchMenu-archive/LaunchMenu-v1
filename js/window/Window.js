loadOnce("/$Utils");
loadOnce("/libraries/ResizeSensor");
loadOnce("/styling/$StyleHandler");
(function(){    
    var BrowserWindow = require('electron').remote.BrowserWindow;
    
    var regexFuncMatch = /(__)?receive([A-Z]\w+)/;
    var sendPrefix = "send";
    var ipcMessagePrefix = "windowMessage";
    var ipcReturnMessagePrefix = "windowReply";
    
    window.Window = class Window{
        constructor(postInitFunc){
            this.__initVars();
            this.__loadScreenBounds();
            this.__setupIPC();
            if(postInitFunc)
                postInitFunc.call(this);
            
            //create frame element
            this.frameTemplate.html = this.frameTemplate.html.replace("_CONTENT_", "<div class=_CONTENT_></div>");
            var frame = $Utils.createTemplateElement(this.constructor.name+"Frame",    this.frameTemplate);
            frame.element.css({width:"fit-content", height:"fit-content", position:"fixed"});
            this.frameTemplateClassName = frame.htmlClassName;
            this.frame$ = frame.querier;
            
            //create window(content) element
            var n = $Utils.createTemplateElement(this.constructor.name, this.contentTemplate);
            this.htmlClassName = n.htmlClassName;
            this.$ = n.querier;
            this.content = n.element;
            
            //add content to frame, and frame to the page
            frame.element.find("._CONTENT_").replaceWith(n.element);
            this.element = frame.element;
            $("body").append(this.element);
            $("body").css("-webkit-user-select","none");
            
            this.__initHtml();            //initialize the html elements
            this.__setupFrameEvents();
        }
        __initVars(){
            this.parentID = window.parentID;
            this.loaded = false;

            this.frameTemplate = {
                html:   `<div class='bd3 bg0 body'>
                            <div class='header bd4'>
                                <div class='title f0'></div>
                                <div class='windowButton bg4Hover f0 close'>&#x1F7A9</div>
                                <div class='windowButton bg4Hover f0 minimize'>&#x2014</div>
                            </div>
                            <div class=content>
                                _CONTENT_
                            </div>
                        </div>`,
                style:  `.body{                            
                            width: fit-content;
                            height: fit-content;
                            position: relative;
                            
                            overflow: hidden;
                            
                            margin: 20px;
                            box-shadow: 0px 0px 18px 2px rgba(0,0,0,0.5);
                              -webkit-user-select: none;
                              -webkit-app-region: no-drag;
                              
                              z-index: -1;
                        }
                        .header{
                            min-width: 200px;
                            min-height: 25px;
                            
                              -webkit-user-select: none;
                              -webkit-app-region: drag;
                              
                              border-bottom-width: 1px;
                              border-bottom-style: solid;
                        }
                        .title{
                            float: left;
                            position: relative;
                            left: 5px;
                            top: 5px;
                        }
                        .windowButton{
                            height: 25px;
                            width: 25px;
                            float: right;
                            
                            line-height: 25px;
                            text-align:center;
                            
                            cursor: pointer;
                            -webkit-app-region: no-drag;
                            font-family: consolas;
                        }
                        .close{
                            line-height: 27px;
                        }
                        .content{
                              -webkit-user-select: auto;
                          }
                        .windowButton:hover{
                            background-
                        }`
            };
            this.contentTemplate = {
                html:   ``,
                style:  ``
            };
            delete window.parentID;
        }
        
        //events that can be tapped into and altered
        __onWidthChange(newWidth, oldWidth){}    //fires when a user resizes the window, and alters the width by doing so
        __onHeightChange(newHeight, oldHieght){} //fires when a user resizes the window, and alters the height by doing so
        __readyFunc(){}                             //fires when the window is done with setting up elements and ipc connections
        __onClose(){}                             //fires when the window closes
        __onMinimize(){}                         //fires when the window minimizes
        __initHtml(){}                 //fires to initialize the html elements
        
        //setup frame events
        __setupFrameEvents(){
            //setup size listener
            var t = this;
            var e = this.element; 
            var rsl = new ResizeSensor(e[0], function(){
                if(!t.resizing){ //if you are dragging the window to resize, we want a more direct call
                    t.resizeWindow(e.width(), e.height());
//                    t.__setHeight(t.frame$(".body").height(), true); //update the content height
                }
            });
            $(function(){
                t.resizeWindow(e.width(), e.height());
            });
            
            //setup close and minimize 
            this.frame$(".close").click(function(){
                t.close();
            });
            this.frame$(".minimize").click(function(){
                t.minimize();
            });
        }
        
        //window size methods
        __updateSize(){
            this.resizeWindow(this.element.width(), this.element.height());
        }
        __setWidth(width){
            var oldWidth = this.frame$(".body").width(); 
            this.frame$(".body").width(width);

            //update content width
            this.content.width(width);
//            this.content.children().css("width","100%");
            
            this.__onWidthChange(width, oldWidth);
        }
        getWidth(){
            return this.frame$(".body").width();
        }
        __setHeight(height, onlyUpdateContentHeight){
            var oldHeight = this.frame$(".body").height();
            this.frame$(".body").height(height);
            
            //update content height
            this.content.height(this.frame$(".body").height()-this.frame$(".header").height());
//            this.content.children().css("height","100%");
            
            this.__onHeightChange(height, oldHeight);
        }
        getHeight(){
            return this.frame$(".body").height();
        }
        
        //resize methods
        __loadScreenBounds(){ //used for a smooth window resizing
            let displays = require('electron').screen.getAllDisplays();
            var minX = Infinity;
            var maxX = -Infinity;
            var minY = Infinity;
            var maxY = -Infinity;
            for(var i=0; i<displays.length; i++){
                var display = displays[i];
                var bounds = display.bounds;
                if(bounds.x+bounds.width>maxX) maxX=bounds.x+bounds.width;
                if(bounds.y+bounds.height>maxY) maxY=bounds.y+bounds.height;
                if(bounds.x<minX) minX=bounds.x;
                if(bounds.y<minY) minY=bounds.y;
            }
            this.screenBounds = {minX:minX, maxX:maxX, minY:minY, maxY:maxY, width:maxX-minX, height:maxY-minY};
            return this.screenBounds;
        }
        __setupResizeCode(){
            var t = this;
            var b = this.frame$(".body");
            var n = this.frameTemplateClassName;
            var size = this.windowArgs.resizeHandleWidth;
            
            //a function to switch the window between fullscreen and 'inwindow' to allow for smooth resizing
            var windowIsInFullScreen = false;
            const setFullScreen = function(bool){
                if(bool){
                    t.element.css({"left":"90000px", "top":"90000px"}); //element will blink anyways (can't get server and client side 100% synchronized)
                                                                        //but this way the blink will at least be clean, not depend on position
                    
                    t.__sendSetFullScreen(true, function(loc){        
//                        t.element.css({"left":"auto", "top":"auto"}); //reset position    
                        t.element.css({"left":Math.floor(loc[0]-t.screenBounds.minX)+"px", 
                                        "top":Math.floor(loc[1]-t.screenBounds.minY)+"px"});
                    });
                }else{
                    var offset = t.element.offset();
                    var loc = [offset.left+t.screenBounds.minX, offset.top+t.screenBounds.minY];
                    var size = [t.element.width(), t.element.height()];
                    t.__sendSetFullScreen(false, loc, size);
                    t.element.css({"left":"auto", "top":"auto"});
                }
                windowIsInFullScreen = bool;
            }
            
            var selectedEl;        //the element that is being dragged
            var startSize;        //the size of the applicable dimension when started dragging
            var startPoint;        //the point of the mouse when started dragging
            var lastSize;        //the difference of the size between 2 updates
            
            var sides = ["left", "top", "right", "bottom"];
            var dim = {left:"width",right:"width", top:"height", bottom:"height"};
            var opposite = function(side){    return sides[(sides.indexOf(side)+2)%4]     }
            
            //go through all sides and create an element to be dragged
            for(var i=0; i<4; i++){
                (function(side){
                    var opSide = opposite(side);
                    var d = dim[side];
                    var icon = (d=="width"?"w":"n")+"-resize";
                    var m = parseFloat(b.css("margin-"+side));
                    var el = $(`
                        <div class='${side}Resize ${n}' style='
                                position:absolute;
                                ${d}: ${size}px;
                                left: ${m}px;
                                right: ${m}px;
                                top: ${m}px;
                                bottom: ${m}px;
                                ${opSide}: auto;
                                ${side}: ${m-size}px;
                                cursor: ${icon};
                                  -webkit-app-region: no-drag;
                            '>
                        </div>
                    `.replace("\n",""));
                    el[0].side = side;
                    el[0].oppositeSide = opSide;
                    el[0].dim = d;
                    t.element.append(el);
                    el.mousedown(function(e){
                        $(this).css(opSide, 0).css(d, "auto"); //make the resize element cover the whole window
                        selectedEl = $(this);
                        startPoint = [e.screenX, e.screenY];
                        startSize = b[d]();
                        lastSize = startSize;
                        
//                        if(!t.disableSelect){    //disable text selection                
//                            t.disableSelect = $("<style >* {user-select:none;} </style>");
//                            t.element.append(t.disableSelect);
//                        }
                        $Utils.disableTextSelection(true);
                        
                        t.__startResizing(side);
                        //set the program to fullscreen for smooth resizing
                        t.resizing = true;
                        setFullScreen(true);
                        console.log("drag");
                    });
                })(sides[i]);
            }
            //listen for any of the elements being dragged
            window.addEventListener('mousemove', function(e){
                if(e.screenX!=0 || e.screenY!=0){ //when going over a window drag area, it shows coordinates 0,0 incorrectly.
                    if(selectedEl){
                        var side = selectedEl[0].side;
                        var i = sides.indexOf(side);
                        var d = dim[side];
                        var dx = e.screenX-startPoint[0];
                        var dy = e.screenY-startPoint[1];
                        var moveDelta = [dx, dy];
                        var newSize = startSize+moveDelta[d=="width"?0:1]*(i<2?-1:1);
                        
                        
                        //make sure the value doesn't exceed the min or max size
                        var dimIndex = d=="width"?0:1;
                        if(t.windowArgs.minSize)
                            newSize = Math.max(t.windowArgs.minSize[dimIndex], newSize);
                        if(t.windowArgs.maxSize)
                            newSize = Math.min(t.windowArgs.maxSize[dimIndex], newSize);
                        
                        //resize the window
                        var delta = newSize-lastSize;
                        t.__resizeSide(side, delta);
                        lastSize = newSize;
                    }            
                }
            })
            $(window).mouseup(function(){
                if(selectedEl){
//                    if(t.disableSelect){    //enable text selection again                    
//                        t.disableSelect.remove();
//                        t.disableSelect = null;
//                    }
                    $Utils.disableTextSelection(false);
                    
                    //stop the resize element from covering the whole window
                    selectedEl.css(selectedEl[0].oppositeSide, "auto").css(selectedEl[0].dim, size);
                    selectedEl = null;
                    
                    //set the program to 'inwindow' 
                    t.resizing = false;
                    if(windowIsInFullScreen)
                        setFullScreen(false);
                    console.log("release");                    
                }
            });
            this.element.width("auto").height("auto");
        }
        __startResizing(side){}
        __resizeSide(side, delta){ //the function that gets called by the dragging of the resize elements
            if(side=="left"){
                this.element.css({left:parseInt(this.element.css("left"))-delta});
            }else if(side=="top"){
                this.element.css({top:parseInt(this.element.css("top"))-delta});
            }
            if(side=="right" || side=="left"){
                this.__setWidth(this.getWidth()+delta);
            }else if(side=="bottom" || side=="top"){
                this.__setHeight(this.getHeight()+delta);
            }
        }
        
        //communication initialisation
        __setupIPC(){
            var t = this;
            
            //detect listener functions
            var funcs = []; //a list of function names that should be connected with ipc
            var classFuncs = this;
            while(classFuncs.__proto__.__proto__){ //go through all functions of all classes except the Object class
                classFuncs = classFuncs.__proto__;
                var fs = Object.getOwnPropertyNames(classFuncs);
                for(var i=0; i<fs.length; i++){
                    var f = fs[i];
                    if(f.match(regexFuncMatch))
                        funcs.push(f);
                }
            }
            
            //setup ipc stuff
            this.realIpc = require('electron').ipcRenderer;
            
            if(this.parentID!=null){
                this.parent = BrowserWindow.fromId(this.parentID);                
            }else{
                this.parent = this.realIpc; 
            }
            
            this.realIpc.on("setupWindowIPC", function(event, data){
                var windowControllerFuncs = data.controllerFuncs;
                var windowArgs = data.windowArgs;
                t.windowArgs = windowArgs;
                
                //setup resize system
                if(windowArgs.resizable && windowArgs.customResize)
                    t.__setupResizeCode();
                //set title
                t.frame$(".title").text(windowArgs.title);
                
                //setup functions that call windows function
                for(var i=0; i<windowControllerFuncs.length; i++){
                    var f = windowControllerFuncs[i];
                    (function(m){
                        var n = (m[1]?m[1]:"")+sendPrefix+m[2];
                        //create function to send ipc message
                        if(!t[n])
                            t[n] = function(){
                                var ar = Array.prototype.slice.call(arguments);
                                for(var i=0; i<ar.length; i++){
                                    //create callback channel if callback function is provided
                                    if(typeof ar[i] == "function"){
                                        (function(f){
                                            t.realIpc.once(ipcReturnMessagePrefix+m[2][0].toUpperCase()+m[2].substring(1),function(event, data){
                                                f.call(t, data);
                                            });                                            
                                        })(ar[i]);
                                        ar.splice(i, 1);
                                    }
                                }
                                t.ipc.send(m[2], ar);
                            }              
                    })(f.match(regexFuncMatch));
                }
                
                //indicate that setup has finished
                t.loaded = true;
                if(t.__readyFunc)
                    t.__readyFunc();
                if(t.readyFunc)
                    t.readyFunc();
            });
            this.parent.send("setupWindowControllerIPC"+window.ID, funcs);
            
            //setup ipc wrapper
            this.ipc = {
                on: function(channel, func){
                    return t.realIpc.on(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1), func);
                },
                once: function(channel, func){
                    return t.realIpc.once(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1), func);
                }, 
                send: function(channel, data){
                    return t.parent.send(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1)+window.ID, data);
                },
//                sendSync: function(channel, data){
//                    return parent.sendSync(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1)+window.ID, data);
//                }
            }
            
            //setup listener functions
            for(var i=0; i<funcs.length; i++){
                (function(f){
                    var n = f.match(regexFuncMatch)[2];
                    t.ipc.on(n, function(event, args){
                        //execute the function, and send back the returned value
                        if(!(args instanceof Array))
                            args = [args];
                        var ret = t[f].apply(t, args);
                        t.parent.send(ipcReturnMessagePrefix+n[0].toUpperCase()+n.substring(1)+window.ID,
                                        ret);
                    })
                })(funcs[i]);
            }
        }
        
        //window control methds
        ready(func){
            this.readyFunc = func;
            return this;
        }
        close(){
            this.parent.send("frameClose"+window.ID);
            this.__onClose();
        }
        resizeWindow(width, height){
            this.parent.send("frameResize"+window.ID, {width: width, height: height});
            if(width!=this.oldWidth)
                this.__onWidthChange(width, this.oldWidth);
            if(height!=this.oldHeight)
                this.__onHeightChange(height, this.oldHeight);
            this.oldWidth = width;
            this.oldHeihgt = height;
        }
        minimize(){
            this.parent.send("frameMinimize"+window.ID);
            this.__onMinimize();
        }
    }
})();