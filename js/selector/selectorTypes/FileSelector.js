/*global variables Class, LargeSetSelector, SelectorItem, $Tree, $Querier, regexEscape, $PreviewHandler, Directory, $Searchbar, $FileMenuHandler, $ContextMenuHandler, $EventHandler*/
loadOnce("../LargeSetSelector")
loadOnce("/$Querier");
loadOnce("/$EventHandler");
loadOnce("/$Utils");
window.FileSelector = class FileSelector extends LargeSetSelector{
	constructor(){
		super();

        this.search();
	}
    __initVars(){
    	super.__initVars();
    	
        this.directory = $Tree;  
        this.searchTerm = "";
        this.history = [];
        this.keyboardEventBuffer = [];
        this.template = { //template for the main structure of the selector
            html:  `<div class='bg0 wrapper'>
		                <div class=header>_HEADER_</div>
		                <div class=list>_LIST_</div>
		                <div class=footer>_FOOTER_</div>
		                <div class=messageOuter style=display:none>
		                    <div class=message>
								<span class='noFileMessage' style=display:none>
									No files could be found Mother Fucker.
								</span>
								<span class='regexErrorMessage' style=display:none>
									No files could be found Mother Fucker.
									<span class='fontError regexError'>
										
									</span>
								</span>
		                    </div>
		                </div>
		            </div>`,
		    style:` .wrapper,
		            .list{
		                width: 100%;
		                height:100%;
		            }
		            .wrapper{
		                float: right;
		                position: relative;
		            }
		            .messageOuter{
		                position: absolute;
		                top: 0%;
		                height: 100%;
		                width: 100%;
		            }
		            .message{
		                padding: 10px;
		                text-align: center;
		                position: relative;
		                top: 50%;
		                left: 50%;
		                transform: translate(-50%, -50%);
		            }`
    	}
    }
 
    //
    setDirectory(directory, dontAddHistory){ //set the current directory and load its files
        if(!dontAddHistory)
            this.history.push({
                directory:  this.directory,
                search:     this.searchTerm,
                index:      this.selectedIndex
            });
        
        this.directory = directory;
        if(directory.parent){
            this.$(".folder").show();
            this.$(".fileName").html(directory.getFullName());
            this.$(".filePath").html(directory.getPath().replace(new RegExp($Utils.regexEscape($Tree.seperator),"g"), $Tree.seperator+"<wbr>"));
        }else{
            this.$(".folder").hide();
        }
        this.search();
        this.__refreshListSize();
    }
    
    //history methods
    gotoParentDirectory(){ //goto the parent directory of this directory
        if(this.directory.parent){
            if($EventHandler.trigger("gotoParentDirectory:pre", this, {parentDirectory:this.directory.parent})){
               this.setDirectory(this.directory.parent);
               this.search(this.searchTerm);
               
               $EventHandler.trigger("gotoParentDirectory:post", this, {parentDirectory:this.directory.parent});
               return true;
            }
        }
        return false;
    }
    gotoPrevDirectory(){ //goto previous item in the history
        var h = this.history.pop();  
        if(h){
            if($EventHandler.trigger("gotoPrevDirectory:pre", this, {history:h})){
                this.setDirectory(h.directory, true);
                var t = this;
                var loadFunc = function(){
                    var list = t.$(".list");
                    list[0].setVerticalOffset((h.index-1)*t.selectorItemHeight-list.height()/2);
                    var element = t.$("#"+h.index)[0];
                    if(element)
                        element.selectorItem.select();
                };
                if(h.search && h.search.length>0){
                    this.search(h.search, loadFunc);  
                    $Searchbar.setText(h.search, false);
                }else{
                    this.search("", loadFunc);
                    $Searchbar.clear();
                }
                
                $EventHandler.trigger("gotoPrevDirectory:poost", this, {history:h});
                return true;
            }
        }
        return false;
    }
    clearHistory(){ //clear all the previous directory history
        if($EventHandler.trigger("clearHistory:pre", this, {})){
            this.history = [];
            
            $EventHandler.trigger("clearHistory:post", this, {});
            return true;
        }
        return false;
    }
    
    //file search
    __searchbarChange(value){
        console.log("search",value);
        return this.search(value);
    }
    search(text, loadEvent){
        if($EventHandler.trigger("search:pre", this, {text:text, onLoadEvent:loadEvent})){
            this.searchTerm = text;
            if(text==null || text.length==0){
                this.setDataSet(this.directory.children);
                this.$(".messageOuter").hide();
                if(loadEvent) loadEvent();
            }else{
                var random = Math.floor(Math.random()*1000);
                console.time("load time"+random);
                var regexSearch = /\/(.+)\/(\w*)/.test(text);
                var t = this;
                this.querying = true;
                var query = regexSearch?$Querier.regexQueryAsync:$Querier.queryAsync;
                if(this.cancelSearch) this.cancelSearch();
                var cancelSearch = query(text, this.directory, function(matches){
                    console.time("lag time"+random);
                    
                    console.time("sort time"+random);
                    $Querier.sortMatches(matches);
                    console.log(" ");
                    console.timeEnd("sort time"+random);
                    
                    if(t.searchTerm.length>0){ //only load the data if the last search was not empty
                        if(!(matches instanceof Array) || matches.length==0){
                            t.setDataSet([]);    
                            t.$(".messageOuter").show();
                            if(!(matches instanceof Array)){
                                t.$(".noFileMessage").hide();
                                t.$(".regexErrorMessage").show();
                                t.$(".regexError").text(matches.message);
                            }else{
                                t.$(".noFileMessage").show();
                                t.$(".regexErrorMessage").hide();
                            }
                        }else{
                            t.$(".messageOuter").hide();
                            t.query = !regexSearch?text:null;
                            t.setDataSet(matches);
                        }
                        console.timeEnd("lag time"+random);
                        console.timeEnd("load time"+random);
                    }
                    if(loadEvent) loadEvent();
                    
                    $EventHandler.trigger("foundMatches:post", t, {text:text, matches:matches});
                    
                    if(t.cancelSearch == cancelSearch){
                        t.querying = false;
                        if(t.keyboardEventBuffer.length>0)
                            t.__executeKeyboardEventBuffer();
                    }
                });
                this.cancelSearch = cancelSearch;
            }
            
            $EventHandler.trigger("search:post", this, {text:text, onLoadEvent:loadEvent});
            return true;
        }
        return false;
    }
    
    //data loading
    setDataSet(list){
    	//inser the requirements into $Querier for match highlighting
        if(this.query)
            $Querier.prepare($Querier.extractRequirements(this.query));
        super.setDataSet(list);
    }
    __loadElements(){
        if(this.query)
            $Querier.prepare($Querier.extractRequirements(this.query));
        super.__loadElements();
    }
    __createItem(file){ 
    	return new FileSelectorItem(file);
    }
    
    //override some Selector methods
    __onHide(){} 	//don't close on hide
    __onClose(){}   //don't destroy when closed
    __onOpen(){
    	//show the searchterm again
        $Searchbar.setText(this.searchTerm, true);
    }
    
    //keyboard events
    __keyboardEvent(event){
        if(!this.querying){
            if(event.key=="Enter"){
                if(event.shiftKey){
                    return this.gotoPrevDirectory();
                }else if(event.ctrlKey){
                    return this.gotoParentDirectory();
                }
            }
            return super.__keyboardEvent(event);
        }else{
            var k = event.key;
            var ret = k=="ArrowUp"||k=="ArrowDown"||k=="Enter";
            
            console.log(this.searchTerm, event.key);
            this.keyboardEventBuffer.push(event);
            
            return ret;
        }
    }
    __executeKeyboardEventBuffer(){
        if(!this.querying){
            while(this.keyboardEventBuffer.length>0){
                var event = this.keyboardEventBuffer[0];
                console.log("call",this.searchTerm,event.key);
                this.__keyboardEvent(event);
                
                this.keyboardEventBuffer.splice(0, 1);
            }
        }
    }
    
    //fix executeItem when there are no results
    executeItem(){
        if(this.dataSet.length>0){
            super.executeItem();
        }
    }
}

loadOnce("../SelectorItem");
window.FileSelectorItem = class FileSelectorItem extends SelectorItem{
    constructor(match){
        super();
        var name;
        if(match.file){
            this.file = match.file;
            this.match = match.match;
            name = match.match.type.highlight(this.file.getFullName(), this.htmlClassName+" backgroundHighlight0");
        }else{
            this.file = match;
            name = this.file.getFullName();
        }
        
        if((this.file) instanceof Directory){
            this.$("img").attr("src", "../resources/images/icons/folder icon.png");
        }
        if(this.file.cut)
            this.setCut(true, true);
        
        this.$(".fileName").html(name);
    }
    __initVars(){
    	super.__initVars();
    	
    	this.template = {
            html:   `<div class='fileIcon'>
    					<img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA">
    				</div>
    				<div class='fileData'>
    					<div class='f0 fileName'></div>
    					<div class='f6 filePath'></div>
    				</div>
    				<br style=clear:both>`,
    		style:  `.root{
                        min-height: 40px;
                        border-bottom-width: 1px;
    		        }
    		        .cut{
    		            opacity: 0.5;
    		        }
    		        .fileIcon{
                        box-sizing: border-box;
                        float: left;
                        width: 40px;
                        height: 40px;
                        padding: 3px;
                    }
                    .fileIcon img{
                        width: 100%;
                        height: 100%;
                    }
                    .fileData{
                        float: left;
                        width: calc(100% - 40px);
                    }
                    .fileData .fileName{
                        word-wrap: break-word;
                        padding: 5px;
                        padding-bottom: 0px;
                    }
                    .fileData .fileName span{
                        border-radius: 2px;
                    }
                    .fileData .filePath{
                        word-break: break-word;
                        padding-right: 5px;
                        font-size: 12px;
                        text-align: right;
                    }`
        }    
    }

    //event setup
    __eventSetup(){
        super.__eventSetup();
        var t = this;
        this.element.mouseup(function(event){
            if(event.button==2){
                t.openContextMenu({left:event.pageX, top:event.pageY});
                event.stopImmediatePropagation();
            }
        });
    }
    
    //setup actions
    openFileMenu(){
        if($EventHandler.trigger("openMenu:pre", this, {})){
            if(!$FileMenuHandler.openFileItemMenu(this))
                return false;
            
            $EventHandler.trigger("openMenu:post", this, {});
            return true;
        }
        return false;
    }
    openContextMenu(offset){
        $FileMenuHandler.openFileItemContextMenu(this, offset);
    }
    __onExecute(){
        return $FileMenuHandler.executeFile(this.file);
    }
    
    //
    __setSelector(selector){
        if(this.file.parent){
            var s = $Utils.regexEscape($Tree.seperator);
            var path = this.file.parent.getPath(selector.directory);
            while(path.length>35){
                var oldPath = path;
                path = path.replace(new RegExp("(\\.\\.\\."+s+")?([^"+s+"]*)"+s),"..."+$Tree.seperator);
                if(oldPath==path){
                    break;   
                }
            }
            this.$(".filePath").text(path);
        }
        
        super.__setSelector(selector);
    }
    select(){ //bind the actionmenu shortcut when item is selected and show preview
        if($EventHandler.trigger("select:pre", this, {})){
            $EventHandler.disableEvents();//don't trigger super's events
            if(super.select()){
                $EventHandler.enableEvents();
                
                $PreviewHandler.openFile(this.file);
                
                var fileMenu = $FileMenuHandler.getFileMenuFromFile(this.file);
                fileMenu.initContextMenu(this);
                
                $EventHandler.trigger("select:post", this, {});
                return true;
            }
        }
        return false;
    }
    __keyboardEvent(event){
        if(event.key=="Tab"){
           this.openFileMenu();
           return true;
        }
        return false;
    }
    
    setCut(state, dontUpdateFile){
        if(!dontUpdateFile)
            this.file.setCut(state);
            
        if(state){
            this.element.addClass("cut");
        }else{
            this.element.removeClass("cut");
        }
    }
}