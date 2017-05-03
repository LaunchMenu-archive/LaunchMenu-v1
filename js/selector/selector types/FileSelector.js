/*global variables Class, LargeSetSelector, SelectorItem, tree, Querier, regexEscape*/
var FileSelector = Class("FileSelector",{
    const: function(){
        this.super.const();
        this.directory = tree;  
    },
    template:{ //template for the main structure of the selector
        html:  `<div class=wrapper>
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
								<span class='regexError'>
									
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
                    background-color:white;
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
                }
                .regexError{
                    color: red;
                }`
    },
    headerTemplate:{
        html:`  <div class=folder style=display:none>
                    <div class=folderIcon>
                        <img class=folderImage src='../resources/images/icons/folder icon.png'>
                    </div>
                    <div class='folderData'>
    					<div class='fileName'></div>
    					<div class='filePath'></div>
    				</div>
    				<br style=clear:both>
                </div>`,
        style:  `.folder{
                    min-height:60px;
                    width: 100%;
                    background-color: #F7F7F7;
                    border-bottom: 1px solid #CCC;
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
                    color: #AAA;
                    font-size: 9px;
                    padding-bottom: 5px;
                }
                `
    },
    setDirectory: function(directory){
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
    search: function(text){
        if(text==null || text.length==0){
            this.setDataSet(this.directory.children);
            this.$(".messageOuter").hide();
        }else{
            console.time("total");
            var matches;
            var regexSearch = false;
            if(/\/(.+)\/(\w*)/.test(text)){
                matches = Querier.regexQuery(text, this.directory);
                regexSearch = true;
            }else{
                matches = Querier.query(text, this.directory);
            }
            
            if(!(matches instanceof Array) || matches.length==0){
                this.setDataSet([]);    
                this.$(".messageOuter").show();
                if(!(matches instanceof Array)){
                    this.$(".noFileMessage").hide();
                    this.$(".regexErrorMessage").show();
                    this.$(".regexError").text(matches.message);
                }else{
                    this.$(".noFileMessage").show();
                    this.$(".regexErrorMessage").hide();
                }
            }else{
                var sortedMatches = Querier.sortMatches(matches);
                this.$(".messageOuter").hide();
                this.setDataSet(sortedMatches, !regexSearch?text:null);
            }
            console.timeEnd("total");
        }
    },
    setDataSet: function(list, query){
        if(query)
            Querier.prepare(Querier.extractRequirements(query));
        this.super.setDataSet(list);
    },
    onHide: function(){}, //don't close on hide
    onClose: function(){}, //don't destroy when closed
    createSelectorItem: function(file){ 
        return new FileSelectorItem(file);
    },
},LargeSetSelector);

var FileSelectorItem = Class("FileSelectorItem",{
    const: function(match){
        this.super.const();
        var name;
        if(match.file){
            this.file = match.file;
            this.match = match.match;
            name = match.match.type.highlight(this.file.getFullName(), this.htmlClassName);
        }else{
            this.file = match;
            name = this.file.getFullName();
        }
        
        this.$(".fileName").html(name);
    },
    setSelector: function(selector){
        this.super.setSelector(selector);
        
        if(this.file.parent){
            var path = this.file.parent.getPath(selector.directory);
            while(path.length>35){
                var oldPath = path;
                path = path.replace(/(\.\.\.\\)?([^\\]*)\\/,"...\\");
                if(oldPath==path){
                    break;   
                }
            }
            this.$(".filePath").text(path);
        }
    },
    selectedStyle: `background-color: #EEE;`,
    template:{
        html:   `<div class='fileIcon'>
					<img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT48NWIxlFg8U3dtHYji6Y_FKp2WeeNnptzHbQw0ljkeRcHaY0Gf18VBhXFpA">
				</div>
				<div class='fileData'>
					<div class='fileName'></div>
					<div class='filePath'></div>
				</div>
				<br style=clear:both>`,
		style:  `.root{
                    min-height: 40px;
                    border-bottom: 1px solid #CCC;
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
                    background-color: #6be1ff;
                    border-radius: 2px;
                }
                .fileData .filePath{
                    word-break: break-word;
                    padding-right: 5px;
                    color: #AAA;
                    font-size: 12px;
                    text-align: right;
                }`
    }    
}, SelectorItem);