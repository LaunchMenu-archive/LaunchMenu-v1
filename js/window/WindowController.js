loadOnce("/$Utils");
(function(){	
	var path = require('path');
    var url = require('url');
	var BrowserWindow = require('electron').remote.BrowserWindow;
	var ipc = require('electron').ipcRenderer;
	var screen = require('electron').screen;

	var regexFuncMatch = /(__)?receive([A-Z]\w+)/;
	var sendPrefix = "send";
	var ipcMessagePrefix = "windowMessage";
	var ipcReturnMessagePrefix = "windowReply";
	
	WindowController = class WindowController{
		constructor(windowClassPath){
			this.__initVars();
			this.__loadScreenBounds();
			
			windowClassPath =  windowClassPath || this.windowClass;
			if(typeof windowClassPath == "string"){ //get script from file
				var script = $ScriptLoader.getScript(windowClassPath)
				if(script){
					script = script.code;
					
					this.__createWindow(script);
				}else{
					console.error("Could not find the specified file");
					this.failed = true;
				}
			}else{ //copy class
				var windowClass = windowClassPath;
				var globalWindowString = "window.WindowClass = ";
				
				if(windowClass){
					//get the script
					var script;
					var loadScriptsScript;
					if(typeof windowClass == "function"){
						script = windowClass.toString();
					}else{
						var load = windowClass.load;
						windowClass = windowClass.class;
						if(windowClass){
							script = windowClass.toString();
							loadScriptsScript = "";
							for(var i=0; i<load.length; i++){
								var l = load[i];
								loadScriptsScript += "loadOnce('/"+$ScriptLoader.getPath(l)+"');\n";
							}
						}else{
							console.error("The windowClass (first argument) must either be an actual Window class,\n" +
											"Or it must be an object that contains a class key and a load key that contains an array with filepaths to load");
							this.failed = true;
							return
						}
					}
					script = globalWindowString+script; //make sure the glass will be global
					
					//get the file that created the windowController (this)
					var match = script.match(/src\s*=\s*(\w+(.\w+)?)/);
					
					//get the class' definition location
					if(match){
						var src = $ScriptLoader.getScript(match[1]);
						if(src){
							src = src.code;
							
							var scriptIndex = src.indexOf(script.substring(globalWindowString.length));
							if(scriptIndex>-1){
								var infront = src.substring(0, scriptIndex).replace(/./g," "); //replace everything but enters with space
								script = infront+script;
							}else{
								console.error("Could not find the linenumber because the class could not be found in the script,\n"+
									"messages and errors coming from the Window object will show incorrect linenumbers");
							}							
						}else{
							console.error("Could not find the linenumber because the script source could not be retrieved,\n"+
								"messages and errors coming from the Window object will show incorrect linenumbers");
						}
						
						script += "\n//# sourceURL="+match[1];
					}else{
						console.error("Could not find the filename, please add a comment with the filename in the first line of the class (//src = filename)\n"+
								"messages and errors coming from the Window object will show an incorrect filename and linenumbers");
					}
					
					this.__createWindow(script, loadScriptsScript);
				}else{
					console.error("Either a Window class must be defined in this windowController (this.windowClass=Window\n"+
									"Or a Window class must be passed to the windowController (new WindowController(Window))");
					this.failed = true;
				}
			}
		}
		__initVars(){
			this.windowArgs = {
                title: "",
        		frame: false,
        		transparent:true,
        		hasShadow: false,
                show: false,
                width:40,
                height:40,
                resizable: false,
                
                //custom args:
                fitContentSize: true,
                customResize: true,
                resizeHandleWidth: 4,
                maxSize: [900, 900],
                minSize: [200, 30],
			}
			this.debug = true;
			this.loaded = false;
		}
		
		//events that can be tapped into and altered
		__readyFunc(){}							 				//fires when the windowController is done with setting up elements and ipc connections
		__onClose(){}							 				//fires when the window closes
		__onMinimize(){}						 				//fires when the window minimizes
		__onResize(oldWidth, newWidth, oldHeight, newHeight){}	//fires when the window resizes
		
		//window setup functions
		__createWindow(script, loadScriptsScript){
			//create the window
			var t = this;
			
			//store resize but don't add to window args
			var resize
			if(this.windowArgs.customResize){
				resize = this.windowArgs.resizable;
				this.windowArgs.resizable = false;				
			}
			this.window = new BrowserWindow(this.windowArgs);
			if(this.windowArgs.customResize){
				this.windowArgs.resizable = resize;
			}
			
			this.window.loadURL(url.format({
    			pathname: path.join($Utils.rootPath(),"js","window","windowHtml.html"),
    			protocol: 'file:',
    			slashes: true
    		}));
			            
            //inject code
            this.window.webContents.on('dom-ready', function(){
            	t.window.webContents.send("windowInit", {
        			script:script, 
        			loadScriptsScript:loadScriptsScript,
        			windowID: WindowController.windowID
    			});
            })
            
            //open debug tools
            if(this.debug){
                this.window.webContents.openDevTools();
            }
            
            this.__setupIPC();
            this.__setupFrameEvents();
		}
		__alignWindow(){
			var t = this;
			if(window.$Window){ //center in parent if possible
        		var parentPos;
        		var parentSize;
        		var setPosition = function(){
        			var thisSize = t.window.getSize();
        			var x = Math.floor(parentPos[0]+ (parentSize[0]-thisSize[0])/2);
        			var y = Math.floor(parentPos[1]+ (parentSize[1]-thisSize[1])/2);
        			t.window.setPosition(x, y);
        		}
        		$Window.sendGetPosition(function(pos){
        			parentPos = pos;
        			if(parentPos && parentSize)
    					setPosition();
        		});
        		$Window.sendGetSize(function(size){
        			parentSize = size;
        			if(parentPos && parentSize)
    					setPosition();
        		});
        	}else{ //center in the main screen
        		var displaySize = screen.getPrimaryDisplay().size;
    			var thisSize = this.window.getSize();
    			var x = Math.floor((displaySize.width-thisSize[0])/2);
    			var y = Math.floor((displaySize.height-thisSize[1])/2);
    			t.window.setPosition(x, y);
        	}
		}
		__loadScreenBounds(){ //used for a smooth window resizing
			let displays = screen.getAllDisplays();
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
		__receiveSetFullScreen(val, loc, size){
			if(val){
				this.prevSize = this.window.getSize();  
				var oldPos = this.window.getPosition();
				this.window.setSize(this.screenBounds.width, this.screenBounds.height);
				this.window.setPosition(this.screenBounds.minX, this.screenBounds.minY);
				return oldPos;
			}else{
				this.__onResize(this.prevSize[0], size[0], this.prevSize[1], size[1]);
				this.window.setSize(size[0], size[1]);
				this.window.setPosition(loc[0], loc[1]);
			}
			
		}
		__setupFrameEvents(){
			var t = this;
			var windowVisible = false;
		    this.realIpc.on("frameResize", function(event, data){
                t.resize(data.width, data.height);
                if(!windowVisible){ //show window once initial size has been determined 
                	t.window.show(); //show window
                	windowVisible = true;
                	
            		t.__alignWindow();      
                }
		    });
		    this.realIpc.on("frameClose", function(event, data){
		    	t.close();
		    });
		    this.realIpc.on("frameMinimize", function(event, data){
		    	t.minimize();
		    });
		}
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
		    var thisWindowID = require('electron').remote.getCurrentWindow().id;
		    
		    //send ipc stuff to the window when requested
		    this.realIpc.on("setupWindowControllerIPC", function(event, windowFuncs){
		    	//setup functions that call windows function
		    	for(var i=0; i<windowFuncs.length; i++){
		    		var f = windowFuncs[i];
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
		    	
		    	//return the functions of this object
		    	t.window.webContents.send("setupWindowIPC", {
		    		controllerFuncs: funcs,
		    		windowArgs: t.windowArgs
		    	});
		    	
		    	//indicate that setup has finished
		    	t.loaded = true;
		    	if(t.__readyFunc)
		    		t.__readyFunc();
		    	if(t.readyFunc)
		    		t.readyFunc();
		    });
		    
		    //setup ipc wrapper
		    this.ipc = {
		    	on: function(channel, func){
		    		return t.realIpc.on(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1), func);
		    	},
		    	once: function(channel, func){
		    		return t.realIpc.once(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1), func);
		    	}, 
		    	send: function(channel, data){
		    		return t.window.webContents.send(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1), data);
		    	},
//		    	sendSync: function(channel, data){
//		    		return t.window.webContents.sendSync(ipcMessagePrefix+channel[0].toUpperCase()+channel.substring(1), data);
//		    	}
		    }
		    
		    //setup listener functions
		    for(var i=0; i<funcs.length; i++){
		    	(function(f){
		    		var n = f.match(regexFuncMatch)[2];
		    		t.ipc.on(f.match(regexFuncMatch)[2], function(event, args){
		    			//execute the function, and send back the returned value
		    			if(!(args instanceof Array))
		    				args = [args];
		    			var ret = t[f].apply(t, args);
		    			t.window.webContents.send(ipcReturnMessagePrefix+n[0].toUpperCase()+n.substring(1),
		    							ret);
		    		})
		    	})(funcs[i]);
		    }
		}
		ready(func){
			this.readyFunc = func;
			return this;
		}
		
		//window functions
		close(){
			this.window.close();
			this.__onClose();
		}
		resize(width, height){
			var oldSize = this.window.getSize();
			this.window.setSize(width, height);
			this.__onResize(oldSize[0], width, oldSize[1], height);
		}
		minimize(){
			this.window.minimize();		
			this.__onMinimize();
		}
		
		//window position and size functions
		receiveGetSize(){
			return this.window.getSize();
		}
		receiveGetPosition(){
			return this.window.getPosition();
		}
		receiveSetSize(width, height){
			this.window.setSize(width, height);
		}
		receiveSetPosition(x, y){
			this.window.setPosition(x, y);
		}
	};
	WindowController.windowID = require('electron').remote.getCurrentWindow().id;
	window.WindowController = WindowController;
})();