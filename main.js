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
let mainWindow

// Keep a global reference of tray object
let tray = null

function createWindow () {
	// Create the browser window.
	// mainWindow = new BrowserWindow({width: 740, height: 480})
	mainWindow = new BrowserWindow({
		title: "Search Window",
		width: 740,
		height: 480,
		useContentSize: true,
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
		pathname: path.join(__dirname, 'gui' ,'launchmenu.html'),
		protocol: 'file:',
		slashes: true
	}))

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})

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
		mainWindow.hide()
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
				app.relaunch()
				app.quit()
			}
		},
		{label: 'Exit', type: 'normal', click: function(){
				app.quit()
			}
		}
	])
	tray.setContextMenu(contextMenu)

	globalShortcut.register('control+f12', function(){
		mainWindow.webContents.openDevTools()
	})

	/*
	localShortcut.register(mainWindow,'Escape',function(){
		if($(".input").val()==""){
			mainWindow.hide()
		} else {
			$(".input").val("");
			$(".placeHolder").show();
		}
	})
	*/
})

//This may not be required for SearchMenu
app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
	    createWindow()
	}
})

// Execution from client side JS
//http://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
var ipc = require('electron').ipcMain;

/*
 * Invoke action takes in a data object.
 * The most important property of the data object is the action property
 * which drives the switch statement.
 */

ipc.on('invokeAction', function(event, data){
	var replyChannel = data.uid
    var result = (function(data){
		switch(data.action) {
			// window class
			case "window.show":
				return mainWindow.show()
    		case "window.hide":
				return mainWindow.hide()
			case "window.getSize":
				return mainWindow.getSize()
			case "window.setSize":
				return mainWindow.setSize(data.width,data.height)
				
			
			// lm class
    		case "lm.settingsShow":
        		return 
			case "lm.readIniFile":
				// Instead of using an ini file we will use a JSON file.
				return readIni(replyChannel)
			case "lm.writeIniFile":
				return writeIni(data.ini)
			
			
			// file class
			case "file.getData":
				return GetPreviewData(data.path, function(result){
        			event.sender.send(replyChannel, result);
        		});
			case "file.getDates":
				return
	        case 'file.getSize':
	        	return
	        case 'file.getPreviewImage':
	        	return
	        case 'file.getIcon32':
	        	return GetFileIcon(data.FileIn, data.FileOut, function(result){
					event.sender.send(replyChannel, result);
				})
	        case 'file.execute':
	        	console.log(data.file)
	        	return
			
			
			//fileSystem class
			case 'fileSystem.getFullFileLists':
				return
	        case 'fileSystem.registerFileHook':
	        	return
	       	case 'fileSystem.unregisterFileHook': 
	       		return
	   		case 'fileSystem.fileExists':
	   			return


		    //system class
            case 'GetOS':
            	return require('os').platform()
			
    		default:
    			return
		}
	})(data);
	if(result)
    	event.sender.send(replyChannel, result);
});

var api = {};
var uid;

	api.window = {
		show: function(id=1){
			if(id!=1) return  //Future implementation
			mainWindow.show();
		},
		hide: function(id=1){
			if(id!=1) return  //Future implementation
			mainWindow.hide();
		},
		getSize: function(){
			return mainWindow.getSize();
		},
		setSize: function(width,height){
			mainWindow.setSize(width,height);	
			return [width,height];
		},
	};

	api.lm = {
		settingsShow: function() {
			
		},
		readIni: function(replyChannel){ // returns javascript object
		var fs = require('fs');
		var path = require('path');
		fs.readFile(path.resolve(__dirname, 'ini.json'), 'UTF-8', function (err,content) {
			event.sender.send(replyChannel, err ? {}: JSON.parse(content));
		})},
		
		writeIni: function(obj,replyChannel){ // returns javascript object
			var fs = require('fs');
			var path = require('path');
			fs.writeFile(path.resolve(__dirname, 'ini.json'), JSON.stringify(obj,null,4), 'UTF-8', function (err,content) {
				if (replyChannel) event.sender.send(replyChannel, err ? false : true);
			});
		}
	}
	
	api.file = {
		getData: function(path,callback){
			
			// returns data (as ascii string)
        },
        getData64: function(path,callback){
			
			// returns data (as base64 string)
        },
        getDates: function(path,callback){
        	
            // returns dates = {DateCreated: rStats.birthtime, DateModified: rStats.mtime, DateAccessed: rStats.atime}
        },
        getSize: function(path,callback){
            
            // returns size (as integer)
        },
        getFilePreview: function(path, callback){
        	
        	// returns pictureData (as base64 string)
        },
    	getIcon32: function (fileIn,callback){
    		
            // returns pictureData (as base64 string) [32x32]
        },
        execute: function(file,args){
            
        },
	}

function GetPreviewData(filepath, callback){
	//let data be the filePath
	var fs = require('fs');
	var stats = undefined;
	var content = undefined;
	var previewPath = filepath + ".lmf"; //launchmenu preview file extension

	//Get stats of file
	fs.stat(filepath,function(error,rStats){
		rStats = "" ? null : {
			DateCreated: rStats.birthtime,
			DateModified: rStats.mtime,
			DateAccessed: rStats.atime,
			Size: rStats.size
		};
		trySendCallback();
	});

	//Get contents of .lmp file if it exists
	fs.readFile(previewPath, 'utf8', function (err,rContent) {
		content = err ? "" : rContent;
		// if content == "" use some default Template TODO
		trySendCallback();
	});

	//If all information gathered, return it.
	var trySendCallback = function(){
		if(stats!=undefined && content!=undefined){
			if(!stats) stats = {};
			stats.content = content;
			callback(stats);
		}
	};
}

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




/**
 * #####  ####   #####  #####
 * #      #   #  #      #    
 * #####  #   #  #  ##  #####
 * #      #   #  #   #  #    
 * #####  ####   #####  #####
 */
 
 
 var pvwSupportedFormats =[]
 var xlToHTML = edge.func("C#\\Excel-HTML.cs");
 
 
 
 edge.func("C#\\Excel-HTML.cs")("C:\\Users\\sancarn\\Documents\\helloExcel.xlsx", function(a,b){console.log(a,b)})
 
 /* global edge */
 function _edgeWrapper(replyChannel,cscode,obj){
 	edge.func(cscode)(obj,function(error,results){
 		event.sender.send(replyChannel, {err: error, res: results});
 	});
 }
 
 ```cs
 Class 
 ```
 
 
 
 
 