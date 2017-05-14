/*global variables Querier tree*/
var WorkerCommunication = (function(){
    var wc = {};
    try{
        var myWorker = new Worker('../js/worker.js');
        var callbackListeners = {};
        myWorker.onmessage = function(event){
            var data = event.data;
            var callback = callbackListeners[data.code];
            delete callbackListeners[data.code];
            callback(data.data);
        };
        wc.getMatches = function(query, callback){
            var code = Math.floor(Math.random()*Math.pow(10,20));
            callbackListeners[code] = function(data){
                callback(wc.translateArrayToFileMatches(data));
            };
            myWorker.postMessage({code:code, type:"getMatches", data:query});
        };
    }catch(e){
        
    }
    
    wc.translateFileMatchesToArray = function(matches){
        var output = [];
        for(var i=0; i<matches.length; i++){
            var match = matches[i];
            
            //translate file to index path
            var indexPath = [];
            var file = match.file;
            while(file.parent){
                var parent = file.parent;
                var index = parent.children.indexOf(file);
                indexPath.unshift(index);
                file = parent;
            }
            
            //add match data
            var matchTypeIndex = Querier.matchTypes.indexOf(match.match.type);
            output.push([[match.match.score, matchTypeIndex],indexPath]);
        }
        return output;
    };
    wc.translateArrayToFileMatches = function(array){
        var output = [];
        for(var i=0; i<array.length; i++){
            var item = array[i];
            
            //translate index path to file
            var file = tree;
            var indexPath = item[1];
            while(indexPath.length>0){
                file = file.children[indexPath.shift()];
            }
            
            //get match data
            var match = {score:item[0][0], type:Querier.matchTypes[item[0][1]]};
            
            output.push({file:file, match:match});
        }
        return output;
    };
    
    
    return wc;
})();