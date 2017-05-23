/*global variables Querier, WorkerCommunication*/
importScripts('../js/quicksort.js');
importScripts('../js/query.js');

importScripts('../test files/tgm\'s programming folder.js');
importScripts('../js/tree.js');

importScripts('../js/settings.js');

importScripts('../js/workerCommunication.js');
function getMatches(query, directory){
    var matches;
    if(/\/(.+)\/(\w*)/.test(query)){
        matches = Querier.regexQuery(query, directory);
    }else{
        matches = Querier.query(query, directory);
    }
    if(matches instanceof Array) matches = Querier.sortMatches(matches, 200);
    return matches;
}
onmessage = function(msg){
    var data = msg.data;
    if(data.type=="getMatches"){
        postMessage({
            code:data.code, 
            data:WorkerCommunication.translateFileMatchesToArray(
                getMatches(
                    data.data.query, 
                    WorkerCommunication.translateArrayToFile(
                        data.data.directory
                    )
                )
            )
        });
    }
};