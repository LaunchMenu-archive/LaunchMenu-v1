/*global variables Utils, Inherit, Preview, PreviewHandler, Actions, Directory*/
PreviewHandler.registerPreviewType(
    Inherit("PreviewDirectory",{
        directory: true,
        template:{
            html:  `<div class='bg3 bd3 header'>
                        <div class=directoryIcon>
                            <img class=directoryImage src='../resources/images/icons/folder icon.png'>
                        </div>
                        <div class='directoryData'>
        					<div class='f0 directoryName'>
        					    <span class=nameValue>some directory that should overflow by now</span>
        					</div>
        					<div class='f0 childCount'>
        					    <div class=childCountInner>
        					        Child count:
        					        <span class=childValue>56</span>
        					    </div>
        					</div>
        				</div>
                    </div>
                    <div class="children">
                        
                    </div>
                    <div class="extraChildrenFound">
                        <span class=extraChildrenValue></span>
                        more children found...
                    </div>
                    `,
            style:` .root{
                        padding: 20px;
                        padding-bottom: 5px;
                    }
                    .header{
                        width: 100%;
                        height:60px;
                        border-width: 1px;
                    }
                    .directoryIcon{
                        width: 66px;
                        height:60px;
                        float: left;
                    }
                    .directoryImage{
                        padding: 2px;
                        margin-left:3px;
                        margin-right:3px;
                        width: 60px;
                        height: 60px;
                    }
                    .directoryData{
                        float: left;
                        width: calc(100% - 66px);
                        height:60px;
                        overflow:hidden;
                    }
                    .directoryName{
                        width: calc(100% - 70px);
                        height: 100%;
                        float: left;
                    }
                    .nameValue{
                        position: relative;
                        top: 50%;
                        transform: translate(0, -50%);
                        
                        font-size: 18px;
                        display: inline-block;
                        width: 100%;
                    }
                    .childCount{
                        width: 70px;
                        height: 100%;
                        float: left;
                    }
                    .childCountInner{
                        position: relative;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        
                        display:inline-block;
                        font-size: 12px;
                        padding: 3px;
                        text-align: center
                    }
                    .childValue{
                        font-size: 18px;
                    }
                    .extraChildrenFound{
                        padding-left: 5px;
                    }`
        },
        childTemplate:{
            html:  `<div class="bg2 bd1 directoryChild">
                        <div class=childIcon>
                            <img class=childImage src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII='>
                        </div>
                        <div class="f3 childName">
                            some name would go here
                        </div>
                    </div>`,
            style: `.directoryChild{
                        height: 30px;
                        width: calc(100% - 10px);
                        margin: 5px;
                        border-width: 1px;
                    }
                    .childIcon{
                        height: 30px;
                        width: 30px;
                        float: left;
                    }
                    .childImage{
                        width: 100%;
                        height: 100%;
                        padding: 2px;
                    }
                    .childName{
                        height: 30px;
                        width: calc(100% - 30px);
                        float: left;
                        line-height: 29px;
                        padding-left: 5px;
                        overflow: hidden
                    }`
        },
        addChild: function(file){
            var n = Utils.createTemplateElement("PreviewDirectoryChild", this.childTemplate);
            
            this.$(".children").append(n.element);
            if(file instanceof Directory){
                n.querier(".childImage").attr("src",'../resources/images/icons/folder icon.png');
            }else{
                
            }
            n.querier(".childName").text(file.getFullName());
        },
        onLoadFile: function(directory){
            this.super.onLoadFile(directory);
            
            //load directory data
            var children = directory.children;
            this.$(".nameValue").text(directory.name);
            this.$(".childValue").text(children.length);
            
            //remove old children
            this.$(".children").children().remove();
            
            //load new children
            var loadCount = 4;
            for(var i=0; i<Math.min(children.length, loadCount); i++)
                this.addChild(children[i]);
            if(children.length>loadCount){
                this.$(".extraChildrenValue").text(children.length-loadCount);
                this.$(".extraChildrenFound").show();
            }else{
                this.$(".extraChildrenFound").hide();
            }
        },
        setGeneralData: function(){
            var file = this.file;
            var path = file.getPath();
            var t = this;
            
            PreviewHandler.setGeneralData("none", null, null, null, path);        
            Actions.file.getDates(path, function(dates){
                if(dates){
                    if(t.file == file){
                        PreviewHandler.setGeneralData(null, dates.dateCreated, dates.dateModified, dates.dateAccessed, null);
                        t.onDatesLoad(dates.dateCreated, dates.dateModified, dates.dateAccessed);
                    }
                }
            });
        },
    },Preview)
);