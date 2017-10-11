const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

//Tray menu
const {Menu,Tray} = require('electron')

//Module for enabling global/local shortcuts
const {globalShortcut} = require('electron')


//npm install --save electron-localshortcut
//const localShortcut = require('electron-localshortcut');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let windows = [];

// Keep a global reference of tray object
let tray = null

// ##IMPORTANT## Set to true on release
var AUTO_UNFOCUS = true;

function createWindow () {
	// Create the browser window.
	// mainWindow = new BrowserWindow({width: 740, height: 480})
	mainWindow = new BrowserWindow({
		title: "Search Window",
		width: 740,
		height: 480,
		skipTaskbar:true,
		frame: false,
		resizable: false,
		transparent:true,
		hasShadow: false,
		thickFrame:false,
		alwaysOnTop:true
	})

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '..',  'gui' ,'launchmenu.html'),
		protocol: 'file:',
		slashes: true
	}))

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	});
	
	windows.push(mainWindow);
}


//Determine if application is already running
//If it is, then restore the current instance and quit this one.
//Else do nothing.
var appAlreadyRunning = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  return true;
});

if (appAlreadyRunning) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
	//Create main window
	createWindow()

	//When Cmd+Space or Ctrl+Space is pressed show main window
	if(false){ // #DEV: process.platform=='darwin'
		globalShortcut.register('Command+Space', function(){
			mainWindow.show()
		})
	} else {
		globalShortcut.register('Alt+Space', function(){
			mainWindow.show()
		})
	}
	
	//When main window loses focus hide it.
	mainWindow.on('blur', function(e){
		if(AUTO_UNFOCUS){
			mainWindow.hide();
		}
	})
	

	//Create tray menu
	const {nativeImage} = require('electron')
	const ico = nativeImage.createEmpty()
	tray = new Tray(ico) //Tray('path/to/my/icon') // Tray(ico)
	tray.setTitle('Launch Menu')	//MAC OS X
	tray.setToolTip('Launch Menu')	//Hover text
	const contextMenu = Menu.buildFromTemplate([
		{label: 'Item1', type: 'checkbox'},
		{label: 'Item2', type: 'checkbox'},
		{label: 'Reload', type: 'normal', click: function(){
				app.relaunch();
				app.quit();
			}
		},
		{label: 'Exit', type: 'normal', click: function(){
				app.quit();
			}
		}
	])
	tray.setContextMenu(contextMenu);

//	globalShortcut.register('control+f12', function(){
//		mainWindow.webContents.openDevTools();
//	})
	mainWindow.webContents.openDevTools();
})

//This may not be required for SearchMenu
app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
	    createWindow();
	}
})

// Execution from client side JS
//http://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
var ipc = require('electron').ipcMain;

//script loading
var fs = require('fs');
ipc.on("loadScripts", function(event, data){
	var root = data.rootFromNode;
	var inpPath = data.inpPath;
	var fPath = data.path;
	var loadSubChildren = data.loadSubChildren;
	var dirName = fPath.split("/").pop();
	
	var found = false;
	if(fs.existsSync(root+fPath)){
		fPath = root+fPath
		found = true;
	}else if(dirName.split(".")[0]==inpPath.split(".")[0]){
		var search = function(dir){
			var files = fs.readdirSync(dir);
			var match;
			files.forEach(function(file){
				if(!match){
					var p = path.join(dir, file);
					if(fs.statSync(p).isDirectory()){
						if(file.split(".")[0]==inpPath.split(".")[0]){
							match = p;
						}else{							
							match = search(p);
						}
					}				
				}
			})
			return match;
		}
		var match = search(root);
		if(match){
			fPath = match;
			found = true;
		}
	}
	
	if(found){
		var outpFiles = [];
		var getFiles = function(dir){
			var files = fs.readdirSync(fPath);
			files.forEach(function(file){
				var p = path.join(dir, file);
				if(fs.statSync(p).isDirectory()){
					if(loadSubChildren)
						getFiles(p);
				}else{
					outpFiles.push({
						absolutePath: p.replace(/\\/g,"/"),
						code: fs.readFileSync(p)+`\n//# sourceURL=${file}` 
					});
				}
			})
		}
		getFiles(fPath);
		event.returnValue = outpFiles;
	}else{
		event.returnValue = {
			error: true,
			message: "Directory could not be found" 
		}
	}
});
ipc.on("loadScript", function(event, data){
	var root = data.rootFromNode;
	var inpPath = data.inpPath;
	var fPath = data.path;
	var fileName = fPath.split("/").pop();
	var found = false;
	if(fs.existsSync(root+fPath)){
		fPath = root+fPath
		found = true;
	}else if(fileName.split(".")[0]==inpPath.split(".")[0]){
		var search = function(dir){
			var files = fs.readdirSync(dir);
			var match;
			files.forEach(function(file){
				if(!match){
					var p = path.join(dir, file);
					if(fs.statSync(p).isDirectory()){
						match = search(p);
					}else{
						if(file.split(".")[0]==inpPath.split(".")[0]){
							match = p;
						}
					}					
				}
			})
			return match;
		}
		var match = search(root);
		if(match){
			fPath = match;
			found = true;
		}
	}
	
	if(found){
		event.returnValue = {
			absolutePath: fPath.replace(/\\/g,"/"),
			code: fs.readFileSync(fPath)+`\n//# sourceURL=${fileName}` 
		};
	}else{
		event.returnValue = {
			error: true,
			message: "File could not be found" 
		}
	}
});



//var listeners = {};
//ipc.on("invokeSettingsChange", function(event,data){
//	var n = listeners[data.name];
//	if(n) n.sender.send(n.uid,data.setting);
//});
//ipc.on("addSettingsListeners", function(event,data){
//	listeners[data.name] = {uid:data.uid, sender:event.sender};
//});


/*
 * Invoke action takes in a data object.
 * The most important property of the data object is the action property
 * which drives the switch statement.
 */
ipc.on('invokeAction', function(event, data){
	var replyChannel = data.uid;
	try{
		var pathParts = data.action.split(/\./g);
		var p = ServerActions;
		for(var i=0; i<pathParts.length; i++){
			p = p[pathParts[i]];
		};
		data.args.push(function(result){
			event.sender.send(replyChannel, result);
		});
	    var result = p.apply(this, data.args);
	    
	}catch(e){
		console.error(e);
		if(replyChannel)
			event.sender.send(replyChannel, ["Error occurred",e]);
	}
});


var ServerActions = function(){
	var api = {};
	var uid;

	api.window = {
		show: function(id){
			if(id==null) id=1;
			if(id!=1) return  //Future implementation
			mainWindow.show();
		},
		hide: function(id){
			if(id==null) id=1;
			if(id!=1) return  //Future implementation
			mainWindow.hide();
		},
		getSize: function(callback){
			callback(mainWindow.getSize());
		},
		setSize: function(width,height){
			mainWindow.setSize(width,height);
		},
		toggleAutoHide: function(state){
			if(state==undefined||state==null){
				AUTO_UNFOCUS = !AUTO_UNFOCUS;
			}else{
				AUTO_UNFOCUS = state;
			}
		},
	};

	api.lm = {
		readIniFile: function(callback){ // returns javascript object
			var fs = require('fs');
			var path = require('path');
			fs.readFile(path.resolve(__dirname, 'ini.json'), 'UTF-8', function (err,content) {
				callback(err ? {}: JSON.parse(content));
			});
		},
		writeIniFile: function(obj,callback){ // returns javascript object
			var fs = require('fs');
			var path = require('path');
			fs.writeFile(
				path.resolve(__dirname, 'ini.json'), 
				JSON.stringify(obj,null,4), 
				'UTF-8', 
				function (err,content) {
					if (callback) callback(err ? false : true);
				}
			);
		},
	}
	
	api.file = {
		getData: function(path,callback){
			var fs = require('fs')
			fs.readFile(path,'utf8', function(err,rContent){
				callback(rContent==err?"":rContent);
			});
			// returns data (as ascii string)
        },
        getData64: function(path,callback){
        	this.getData(path,function(s){
        		callback(new Buffer(s).toString('base64'));
        	});
			// returns data (as base64 string)
        },
        getDates: function(path,callback){
        	var fs = require('fs');
            //Get stats of file
			fs.stat(path,function(error,rStats){
				var dates = rStats==undefined ? null : {
					dateCreated: rStats.birthtime,
					dateModified: rStats.mtime,
					dateAccessed: rStats.atime
				};
				callback(dates);
			});
            // returns dates = {DateCreated: rStats.birthtime, DateModified: rStats.mtime, DateAccessed: rStats.atime}
        },
        getSize: function(path,callback){
            var fs = require('fs');
            
            //Get stats of file
			fs.stat(path,function(error,rStats){
				var size = rStats==undefined ? null : rStats.size;
				callback(size);
			});
            // returns size (as integer)
        },
        getFilePreview: function(path, callback){
        	// returns pdf or picture data (as base64 string)
        },
    	getIcon32: function (fileIn,callback){
    		
            // returns pictureData (as base64 string) [32x32]
        },
        execute: function(file,args){
        	if(!file) throw new Error("No filepath specified.")
        	if(args==null){
				var shell = require('electron').shell;
				shell.openItem(file);
        	} else {
        		throw new Error("Ur fucked m8");
        	}
        },
        select: function(file){
        	if(!file) throw new Error("No filepath specified.")
        	var shell = require('electron').shell
			shell.showItemInFolder(file)
        },
        delete: function(file){
        	if(!file) throw new Error("No filepath specified.")
        	var shell = require('electron').shell;
        	shell.moveItemToTrash(file);
        },
	}
	
	api.fileSystem = {
		getFullFileLists: function(roots, callback){
			
		},
		registerFileHook: function(path, callback){
		 	
		},
		unregisterFileHook: function(uid){
		 	
		},
		fileExists: function(path, callback){
			
		},
	}
	
	api.system = {
		getOS: function(callback){
			callback(process.platform) 
		},
		beep: function(){
			var shell = require('electron').shell;
			shell.beep();
		},
	}
	
	api.automation = {
		dllcall: function(args,callback){
			
		},
		edge: function(csCode,args,callback){
			
		},
		cmd: function(dosCode,args,callback){
			
		},
		batch: function(dosCode,args,callback){
			
		},
		vbs: function(vbsCode,args,callback){
			
		},
		powershell: function(psCode,args,callback){
			
		},
		applescript: function(asCode,args,callback){
			
		},
		jxa: function(jxaCode,args,callback){
			
			this.wrapper = function(jxaCode){
				return dedent(`
            		// Try to catch when __args should be passed as an object rather than as a set of arguments.
            		function run(__args){
            		    var __count = /\\((.*?)\\)/.exec(Invoke.toString())[1].split(",").length
            		    if ((__count == 1) & __args.length > 1){
            		        return Invoke(__args);
            		    } else {
            		        return Invoke.apply(this,__args);
            		    }
            		}\n\n{//jxaCode//}`).replace('{//jxaCode//',jxaCode);
			}
		},
		objC: function(objcCode,args,callback){
			//Compiles and executes dynamically with gcc
		},
		python: function(pyCode,args,callback){
			
		},
		bash: function(bashCode,args,callback){
			
		},
		webJS: function(jsCode,args,callback){
			
		},
		fromFile: function(action,codeFile,args,callback){
			
		},
	}
	
	return api;
}();

// generateFileList('.',function(list){console.log(list)})

// async version with basic error handling
//given a path e.g. walk('.',function(e){console.log(e)})
function generateFileList(dir, callback){
	var list = []
	if(dir[0]=='.'){
		dir = __dirname + dir.substring(1)
	}
	walk(dir,function(path){
		// console.log(path);
		list.push(path);
	},
	function(){
		callback(list);
	});
}
var n = 0;
function walk(dir, callback, complete, recursion) {
	if(!recursion) n=0
	
    var fs = require('fs'),
        path = require('path');
        
    n++;
    fs.readdir(dir, function(err, files){
        if (err) {
            throw new Error(err);
        }
        files.forEach(function (name) {
            var filePath = path.join(dir, name);
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                callback(filePath.replace(/\//g,"\\"), stat);
            } else if (stat.isDirectory()) {
            	callback(filePath.replace(/\//g,"\\") + '\\', stat);
                walk(filePath, callback, complete, true);
            }
        });
        if(n--==0){
        	complete();
        }
    });
}
/*
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.c9\.nakignore
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.c9\metadata\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.c9\project.settings
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\COMMIT_EDITMSG
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\FETCH_HEAD
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\HEAD
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\branches\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\config
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\description
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\hooks\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\index
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\info\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\logs\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\objects\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\.git\refs\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\C#\Excel-HTML.cs
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\C#\RunningObjectTable.cs
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\SS\LaunchBar.ahk
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\SS\fuzzysearch.js
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\SS\fuzzyset.js
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\SS\main.js
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\VB\ExtractIcon.VB
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\Win32\ChangeAppType.ahk
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\Win32\Compile Instructions.txt
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\Win32\DynaCall\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\Win32\Test\
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\data\1.png
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\data\2.png
\Users\Sancarn\Downloads\LaunchMenu 21 May 2017 02-12\data\3.png
*/

// Usage: Actions.getIconAsync("data\\1.png","data\\1icon.png", function(e){console.log(e)})
//        Actions.getIconAsync("C:\\Users\\sancarn\\Desktop\\Client.zip","data\\1icon.png", function(e){console.log(e)})
function GetFileIcon(FileIn, FileOut, callback){
	//Sends message back to gotIcon.
	var exec = require('child_process').exec;
	var cmd = `"VB\\ExtractIcon.exe" "${FileIn}" "${FileOut}"`;
	exec(cmd,function(error,stdout,stderr){
		if(error){
			console.log("Error in GetFileIcon(): " + error);
		}
		var ret = stdout ? stdout : stderr;
		callback(ret);
	});
}


/* Get foreground window name - Windows.
var FFI = require('ffi');
function TEXT(text){
   return new Buffer(text, 'ucs2').toString('binary');
}

var user32 = new FFI.Library('user32', {
   'GetForegroundWindow': [
      'int32', []
   ],
   'GetWindowText': [
      'int32', ['int32','string','int32']
   ]
});

function getCaption(){
    //Create a buffer of 256 characters
    var caption = ""
    var hWnd = user32. GetForegroundWindow()
    getWindowText(hWnd,var caption,256)
    return TEXT(caption)
}
*/

/* Get foreground window name - Mac.
	function getActiveWindowTitle(){
		// Special case if Terminal is at front
		if(Application('Terminal').frontmost()){
			return ['Terminal',Application('Terminal').windows[0].name()]
		}


		var otherApps = [];
		var system = Application('System Events')
		for (i in system.processes()){
			var process = system.processes()[i]
			try {
				if(process.attributes["AXFrontmost"].value()){
					for(j in process.windows){
						var window = process.windows[j]
						if(window.attributes["AXFocused"].value()){
							return [process.name(),window.title()]
						}
					}
				}
			} catch (e) {
				otherApps.push(process.name())
			}
		}
		//If no process is found to be frontmost, return those processes which don't have attributes
		return otherApps
	}

	function getActiveWindowTitle2(){ //This is a bit slower but perhaps more consistent...?
		const currentApplication = Application('System Events').applicationProcesses.where({
			frontmost: true
		})[0];
		return currentApplication.title()
	}
*/




/*
 * #####  ####   #####  #####
 * #      #   #  #      #    
 * #####  #   #  #  ##  #####
 * #      #   #  #   #  #    
 * #####  ####   #####  #####
 */
 
 
 //	const edge = require('edge')
 //	
 //	var pvwSupportedFormats =[]
 //	var xlToHTML = edge.func("C#\\Excel-HTML.cs");
 //	
 //	
 //	
 //	edge.func("C#\\Excel-HTML.cs")("C:\\Users\\sancarn\\Documents\\helloExcel.xlsx", function(a,b){console.log(a,b)})
 //	
 //	/* global edge */
 //	function _edgeWrapper(replyChannel,cscode,obj){
 //		edge.func(cscode)(obj,function(error,results){
 //			event.sender.send(replyChannel, {err: error, res: results});
 //		});
 //	}
 //	
 //	```cs
 //	Class 
 //	```
 
 
 
 
 