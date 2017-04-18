function Settings(){
    this.minimalMatchScore = 0.10; //the minimal match score a file needs to have in order to show up
    this.searchDepth = 25; //the amount of sub directories that should be searched
    this.loadFileCount = 13; //the amount of matches that should be loaded at a time
    this.showTimeInPreview = true; //if the time should be shown in the preview aswell as the date
    this.maxResults = 1000; //the max amount of results to load to ensure the sorting won't be too laggy
}
var settings = new Settings();