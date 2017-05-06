/*global variables Class, Selector, SelectorItem, Searchbar, Querier*/
var Menu = Class("Menu",{
    addItem: function(img, text, func){
        this.super.addItem(new MenuItem(img, text, func));
    },
    onOpen: function(){
        Searchbar.clear(true);
        this.searchbarChange("");
        if(this.selectorItems.length>0)
            this.selectorItems[0].select();
    },
    onClose: function(){}, //don't restroy on close
    searchbarChange: function(value){
        for(var i=0; i<this.selectorItems.length; i++){
            this.selectorItems[i].element.hide();
        }
        
        //query for matches
        var matches;
        var regexSearch = false;
        if(/\/(.+)\/(\w*)/.test(value)){
            matches = Querier.regexQueryList(value, this.selectorItems, function(){
                return this.text;
            });
            regexSearch = true;
        }else{
            matches = Querier.queryList(value, this.selectorItems, function(){
                return this.text;
            }, 1);
        }
        
        if(!(matches instanceof Array) || matches.length==0){
            this.$(".messageOuter").show();
            if(!(matches instanceof Array)){
                this.$(".noActionsMessage").hide();
                this.$(".regexErrorMessage").show();
                this.$(".regexError").text(matches.message);
            }else{
                this.$(".noActionsMessage").show();
                this.$(".regexErrorMessage").hide();
            }
        }else{
            this.$(".messageOuter").hide();
            
            //show matches
            Querier.prepare(value);
            for(var i=0; i<matches.length; i++){
                var menuItem = matches[i].item;
                menuItem.highlight(matches[i].match.type);
                menuItem.element.show();
            }
            if(!this.selectedItem.element.is(":visible") && matches.length>0)
                matches[0].item.select();
            this.$(".list").scrollbar("reset");
        }
    },
    template:{ //template for the main structure of the selector
        html:  `<div class='bg0 wrapper'>
                    <div class=header>_HEADER_</div>
                    <div class=list>_LIST_</div>
                    <div class=footer>_FOOTER_</div>
                    <div class=messageOuter style=display:none>
                        <div class=message>
    						<span class='noActionsMessage' style=display:none>
								No actions could be found Mother Fucker.
    						</span>
    						<span class='regexErrorMessage' style=display:none>
    							No actions could be found Mother Fucker.
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
},Selector);
var MenuItem = Class("MenuItem",{
    const: function(img, text, func){
        this.super.const();
        this.func = func;
        this.text = text;
        this.$("img").attr("src", img);
        this.$(".textInner").text(text);
    },
    highlight: function(type){
        if(type){
            this.$(".textInner").html(type.highlight(this.text, this.htmlClassName+" backgroundHighlight0"));
        }else{
            this.$(".textInner").text(this.text);
        }
    },
    execute: function(){
        if(this.func)
            return this.func.call(this.selector);
    },
    template:{
        html:   `<div class=icon>
                    <img>
                </div>
                <div class='f0 text'>
                    <div class=textInner></div>
                </div>
                <br style=clear:both;>`,
        style:  `.root{
                    min-height: 40px;
                    width: 100%;
                    border-bottom-width: 1px;
                }
                .icon{
                    width: 40px;
                    height: 40px;
                    float: left;
                }
                img{
                    padding: 3px;
                    width: 40px;
                    height: 40px;
                }
                .text{
                    height: 40px;
                    width: calc(100% - 40px);
                    padding-left: 10px;
                    float: left;
                }
                .textInner{
                    position: relative;
                    font-size: 20px;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }`
    }
}, SelectorItem);