importScripts('../js/quicksort.js');
importScripts('../js/query.js');

importScripts('../test files/tgm\'s programming folder.js');
importScripts('../js/tree.js');

importScripts('../js/settings.js');
function getMatches(query){
    var matches;
    var regexSearch = false;
    if(/\/(.+)\/(\w*)/.test(query)){
        matches = Querier.regexQuery(query);
        regexSearch = true;
    }else{
        matches = Querier.query(query);
    }
    if(matches) matches = Querier.sortMatches(matches);
    return matches;
}
onmessage = function(msg){
    console.log('Message received from main script');
    // var workerResult = 'Result: ' + msg.data;
    console.log('Posting message back to main script');
    postMessage(getMatches(msg.data)[0].file.getFullName());
}