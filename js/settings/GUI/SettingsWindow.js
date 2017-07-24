loadOnce("/window/Window");
loadOnce("/GUIelements/TreeBranchElement");
window.SettingsWindow = class SettingsWindow extends Window{
	constructor(){
		super();
	}
	__initVars(){
		super.__initVars();

        this.contentTemplate = {
            html:   `<div class='navigator f0'>
		            	<tree-branch name=poop>
		            		<tree-branch name=stuff>
		            			<b>test</b>
		            		</tree-branch>
		            		<tree-branch name=things>
		            			<tree-branch name=something>
			            			<b>test</b>
			            		</tree-branch>
		            			<b>test</b>
		            		</tree-branch>
		            	</tree-branch>
        			</div>`,
            style:  `.root{
            			width: 650px;
            			height: 400px;
            		}
            		.navigator{
            			height: 100%;
            			padding: 5px;
            			background-color: purple;
            			width: fit-content;
            		}`
        };
	}
	__htmlInitialisation(){
		var branch = new TreeBranchElement("stuff");
		this.$(".navigator").append(branch);
//		this.$(".navigator").append("<tree-branch></tree-branch>");
	}
};