function invokeAction(action, callback){
    var ipc = require('electron').ipcRenderer;
    if(callback) ipc.once('actionReply', callback);
    ipc.send('invokeAction',action);
}

function windowSetSize(size){
    var ipc = require('electron').ipcRenderer;
    ipc.send('windowSetSize',size);
}

