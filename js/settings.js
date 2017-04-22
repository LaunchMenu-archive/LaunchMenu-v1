var Settings = (function(){
    var Settings = {
        minimalMatchScore:0.005, //the minimal match score a file needs to have in order to show up
        searchDepth:Infinity, //the amount of sub directories that should be searched
        loadFileCount:13, //the amount of matches that should be loaded at a time
        showTimeInPreview:true, //if the time should be shown in the preview aswell as the date
        maxResults:500, //the max amount of results to load to ensure the sorting won't be too laggy
        minimalSearchLength:0, //how many characters the search key should contain before doing the search
    };
    return Settings;
})();