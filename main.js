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
const localShortcut = require('electron-localshortcut');

//Add Jquery
let $ = require('jquery');

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

	// Implement JQuery
	mainWindow.$ = $;

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
	globalShortcut.register('f6',function(){
		resizeGui(-300)
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

var resizeGui = function(dw,dh,multiplier,fps,seconds){
	var steps = seconds * fps
	var sleep = seconds / steps
	var s = mainWindow.getSize()
	for(var i=0;i<steps;i++){
		var th = s[1] + dh * multiplier(i/steps)
		var tw = s[0] + dw * multiplier(i/steps)
		mainWindow.setSize(tw,th)
		require('sleep').msleep(seconds/fps)
	}
}

// Execution from client side JS
//http://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
var ipc = require('electron').ipcMain;
ipc.on('invokeAction', function(event, data){
    var result = (function(data){
		switch(data) {
    		case "WindowHide":
				mainWindow.hide()
				return
    		case "SettingsShow":
        		return
			case "GetWindowSize":
				return mainWindow.getSize()
    		default:
        		return
		}
	})(data);
    event.sender.send('actionReply', result);
});
ipc.on('windowSetSize', function(event,data){
	mainWindow.setSize(data[0],data[1])
})
ipc.on('getIcon',function(event,data){
	//Expects data = {FileIn: "my/executable.exe", FileOut: "my/file.png"}
	//Sends message back to gotIcon.
	var exec = require('child_process').exec;
	var cmd = `VB/ExtractIcon.exe "${data.FileIn}" "${data.FileOut}"`
	exec(cmd,function(error,stdout,stderr){
		event.sender.send('gotIcon', stdout + ":" + stderr)
		if(error){
			console.log("Error in getIcon(): " + error)
		}
	})
})

