/*global variables Class, LargeSetSelector, SelectorItem, tree, Querier, regexEscape, PreviewHandler, Directory, Searchbar, ActionMenuHandler, WorkerCommunication, ContextMenuHandler*/
var FileSelector = Class("FileSelector",{
    const: function(){
        this.super.const();
        this.directory = tree;  
        this.search();
        this.searchTerm = "";
        this.history = [];
    },
    template:{ //template for the main structure of the selector
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
    },
    headerTemplate:{
        html:`  <div class='bd3 bg1 folder' style=display:none>
                    <div class=folderIcon>
                        <img class=folderImage src='../resources/images/icons/folder icon.png'>
                    </div>
                    <div class='folderData'>
    					<div class='f0 fileName'></div>
    					<div class='f6 filePath'></div>
    				</div>
    				<br style=clear:both>
                </div>`,
        style:  `.folder{
                    min-height:60px;
                    width: 100%;
                    border-bottom-width:1px;
                }
                .folderIcon{
                    float: left;
                    width: 60px;
                    height: 60px;
                }
                .folderImage{
                    padding: 4px;
                    width: 100%;
                    height: 100%;
                }
                .folderData{
                    float: right;
                    width: calc(100% - 60px);
                }
                .fileName{
                    padding-top: 5px;
                    font-size: 20px;
                    width: 100%;
                }
                .filePath{
                    width: 100%;
                    word-break: break-word;
                    padding-right: 5px;
                    font-size: 9px;
                    padding-bottom: 5px;
                }
                `
    },
    setDirectory: function(directory, dontAddHistory){
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
            this.$(".filePath").html(directory.getPath().replace(new RegExp(regexEscape(tree.seperator),"g"), tree.seperator+"<wbr>"));
        }else{
            this.$(".folder").hide();
        }
        this.search();
        this.refreshListSize();
    },
    gotoParentDirectory: function(){
        if(this.directory.parent){
           this.setDirectory(this.directory.parent);
           this.search(this.searchTerm);
           return true;
        }
    },
    gotoLastDirectory: function(){ //goto last item in the history
        var h = this.history.pop();  
        if(h){
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
                Searchbar.setText(h.search, false);
            }else{
                this.search("", loadFunc);
                Searchbar.clear();
            }
            return true;
        }
    },
    clearHistory: function(){
        this.history = [];
    },
    search: function(text, loadEvent){
        this.searchTerm = text;
        if(text==null || text.length==0){
            this.setDataSet(this.directory.children);
            this.$(".messageOuter").hide();
            if(loadEvent) loadEvent();
        }else{
            console.time("load time");
            var regexSearch = /\/(.+)\/(\w*)/.test(text);
            var t = this;
            WorkerCommunication.getMatches(text, function(matches){
                if(t.searchTerm.length>0){ //only load the data if the last search was not empty
                    console.time("lag time");
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
                        t.setDataSet(matches, !regexSearch?text:null);
                    }
                    console.log(" ");
                    console.timeEnd("lag time");
                    console.timeEnd("load time");
                }
                if(loadEvent) loadEvent();
            });
        }
    },
    setDataSet: function(list, query){
        if(query)
            Querier.prepare(Querier.extractRequirements(query));
        this.super.setDataSet(list);
    },
    onHide: function(){}, //don't close on hide
    onClose: function(){}, //don't destroy when closed
    onOpen: function(){
        Searchbar.setText(this.searchTerm, true);
    },
    createSelectorItem: function(file){ 
        return new FileSelectorItem(file);
    },
    
    keyboardEvent: function(event){
        if(event.key=="Enter"){
            if(event.shiftKey){
                return this.gotoLastDirectory();
            }else if(event.ctrlKey){
                return this.gotoParentDirectory();
            }
        }
        return this.super.keyboardEvent(event);
    },
    searchbarChange: function(value){
        this.search(value);
    }
},LargeSetSelector);

var FileSelectorItem = Class("FileSelectorItem",{
    const: function(match){
        this.super.const();
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
    },
    setSelector: function(selector){
        this.super.setSelector(selector);
        
        if(this.file.parent){
            var s = regexEscape(tree.seperator);
            var path = this.file.parent.getPath(selector.directory);
            while(path.length>35){
                var oldPath = path;
                path = path.replace(new RegExp("(\\.\\.\\."+s+")?([^"+s+"]*)"+s),"..."+tree.seperator);
                if(oldPath==path){
                    break;   
                }
            }
            this.$(".filePath").text(path);
        }
    },
    select: function(){
        this.super.select();
        PreviewHandler.openFile(this.file);
        
        var actionMenu = ActionMenuHandler.getActionMenuFromFile(this.file);
        var contextMenu = actionMenu.contextMenu;
        if(contextMenu){
            ContextMenuHandler.setSelectedContextMenu(contextMenu, this);
        }
    },
    keyboardEvent: function(event){
        if(event.key=="Tab"){
            this.openActionsMenu();
            return true;
        }
    },
    openActionsMenu: function(){
        ActionMenuHandler.openFileItemMenu(this);  
    },
    eventSetup: function(){
        this.super.eventSetup();
        var t = this;
        this.element.mouseup(function(event){
            if(event.button==2){
                t.openContextMenu({left:event.pageX, top:event.pageY});
                event.stopImmediatePropagation();
            }
        });
    },
    openContextMenu: function(offset){
        ActionMenuHandler.openFileItemContextMenu(this, offset);
    },
    execute: function(){
        ActionMenuHandler.executeFile(this.file);
    },
    setCut: function(state, dontUpdateFile){
        if(!dontUpdateFile)
            this.file.setCut(state);
            
        if(state){
            this.element.addClass("cut");
        }else{
            this.element.removeClass("cut");
        }
    },
    template:{
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
}, SelectorItem);