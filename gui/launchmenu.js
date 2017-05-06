/*global variables FileSelector, searchbar, SelectorHandler, $, tree, Searchbar*/
var fileSelector = new FileSelector();

Searchbar.addEventListener(function(event){
    return SelectorHandler.keyboardEvent(event);
});
Searchbar.addEventListener(function(event){
    if(event.key=="Escape"){
        if(fileSelector.directory.parent){
            Searchbar.setText("");
            fileSelector.setDirectory(tree);
        }else{
            
        }
    }    
});

Searchbar.addValueListener(function(value){
    return SelectorHandler.searchbarChange(value);
});

$(function(){
    fileSelector.open(0);
});