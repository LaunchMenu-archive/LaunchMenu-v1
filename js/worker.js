/*global variables Querier, WorkerCommunication*/
importScripts('../js/quicksort.js');
importScripts('../js/query.js');

importScripts('../test files/tgm\'s programming folder.js');
importScripts('../js/tree.js');

importScripts('../js/settings.js');

importScripts('../js/workerCommunication.js');
function getMatches(query){
    var matches;
    if(/\/(.+)\/(\w*)/.test(query)){
        matches = Querier.regexQuery(query);
    }else{
        matches = Querier.query(query);
    }
    if(matches instanceof Array) matches = Querier.sortMatches(matches, 200);
    return matches;
}
onmessage = function(msg){
    var data = msg.data;
    if(data.type=="getMatches"){
        postMessage({code:data.code, data:WorkerCommunication.translateFileMatchesToArray(getMatches(msg.data.data))});
    }
};