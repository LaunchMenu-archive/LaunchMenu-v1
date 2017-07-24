loadOnce("/GUIelements/BaseElement");
window.TreeBranchElementClass = class TreeBranchElementClass extends BaseElementClass{
	constructor(name){
		super();
		
		this.$(".title").text(name||this.attr.name);
	}
	__initVars(){
		super.__initVars();
		this.transitionTime = 200;
		this.resizeHorizontal = true; //if the element should also change its width when hiding its content
		this.template = {
			html: `	<div class='header f0'>
						<div class=headerInner>
							<div class=arrow></div
							><div class=title>[title placeholder]</div>
						</div>
					</div>
					<div class=content>
						<div class=contentInner>
							_CHILDREN_
						</div>
					</div>`,
			style: `tree-branch{
						width: fit-content;
						min-width: 100%;
					}
					.header{ 
						white-space: nowrap;
						height: 20px;
						cursor: pointer;
					}
						.headerInner{
							width: fit-content;
							height: 100%;
						}
						.arrow{
						    width: 0px;
						    height: 0px;
						    display: inline-block;
							vertical-align: top;
							
						    position: relative;
						    top: 50%;
						    transform: translate(0, -50%);
						    
						    border-width: 0px;
						    border-top-width: 5px;
						    border-bottom-width: 5px;
						    border-left-width: 10px;
						    border-style: solid;
						    border-top-color: transparent;
						    border-bottom-color: transparent;
							transition: transform `+this.transitionTime+`ms;
						}
						.opened>.header>.headerInner>.arrow{
							transform: translate(0, -50%) rotate(90deg);
							transition: transform `+this.transitionTime+`ms;
						}
						.title{
							margin-left: 3px;
							display: inline-block;
							vertical-align: top;
						}
					.content{
						width: fit-content;
						min-width: 100%;
						overflow: hidden;
						height: 0px;
						`+(this.resizeHorizontal?"width: 0px;":"")+`
					}
						.contentInner{
							width: fit-content;
							margin-left: 13px;
						}`
		}
	}
	__htmlInitialisation(){
		var t = this;
		this.$(".header").click(function(){
			if(t.isOpen())		t.close();
			else				t.open();
		});
	}
	
	//methods to open/close the branch
	isOpen(){
		return $(this).is(".opened");
	}
	__resizeStep(per){
		//height change
		this.$(".content").height(this.$(".contentInner").height() * per) //set height to percentage of content height

		//width change
		if(this.resizeHorizontal){
			var headerWidth = this.$(".headerInner").width();
			var contentWidth = this.$(".contentInner").width()+parseInt(this.$(".contentInner").css("margin-left"));
			
			var delta = Math.max(0,contentWidth-headerWidth);
			this.$(".content").outerWidth(headerWidth + delta*per);
		}
	}
	open(){
		var t = this;
		$(this).addClass("opened")
		
		//animate the content height and width change
		if(this.an) this.an.stop(true) //stop previousAnimation
		this.an = $({per:0});
		this.an.animate({per:1}, {duration:this.transitionTime, step: function(now){
			t.__resizeStep(now);
		},complete:function(){ //animate the height
			t.$(".content").height("auto"); //set the height to auto afterwards, so it can adjust as the contents change
			
			if(t.resizeHorizontal){
				t.$(".content").width("auto"); //set the width to auto afterwards, so it can adjust as the contents change
			}
		}});
	}
	close(){
		var t = this;
		$(this).removeClass("opened");
		
		//animate the content height and width change
		if(this.an) this.an.stop(true) //stop previousAnimation
		this.an = $({per:1});
		this.an.animate({per:0}, {duration:this.transitionTime, step: function(now){
			t.__resizeStep(now);
		}});
	}
}
window.TreeBranchElementClass.registerElement(true);