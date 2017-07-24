loadOnce("/$Utils");
window.BaseElementClass = class BaseElementClass extends HTMLElement{
	constructor(){
		super();
		this.__initVars();
		
		//get a clean object of attributes
		this.attr = {};
		for(var i=0; i<this.attributes.length; i++){
			var attr = this.attributes[i];
			this.attr[attr.nodeName] = attr.nodeValue;
		}
		
		//create element out of template
		var n;
		this.template.html = this.template.html.replace("_CHILDREN_","<div class=_CHILDREN_></div>")
		if(this.hasUniqueStyling){			
			var UID = Math.floor(Math.random()*Math.pow(10,7)); //add UID to element because there could be many instances of this element
			n = $Utils.createTemplateElement(this.initialHtmlClassName, this.template, UID);
		}else{
			n = $Utils.createTemplateElement(this.initialHtmlClassName, this.template);
		}
		
		//save the original children
		var originalChildren = $(this).children();
        
		//add element's contents to this element
		this.htmlClassName = n.htmlClassName;
		var t = $(this);
		t.append(n.element.contents());
		t.addClass(this.htmlClassName);
        this.$ = $Utils.createQueryNode(t);
        
        //setup children of the element
        originalChildren.remove();
        this.__setupChildElements(originalChildren);
        this.__htmlInitialisation();
	}
	__initVars(){
		this.template = {
			html: `_CHILDREN_`,
			style:``
		}
		this.hasUniqueStyling = false;
		
		//the class name that html elements made by this object's template (this name must be unique for this js class)
		this.initialHtmlClassName = this.constructor.name.replace(/Class$/,""); 
	}
	
	//methods that can easily be tapped into and altered
	__setupChildElements(originalChildren){ 			//moving all children to the correct location defined in the template
		var childrenPlaceHolder = this.$("._CHILDREN_");
		var destination = childrenPlaceHolder.parent();
		childrenPlaceHolder.remove();
		
		var t = this;
		var i = 0;
		originalChildren.each(function(){
			t.__setupChildElement($(this), destination, i++);
		});
	}
	__setupChildElement(child, destination, index){ 	//moving a specific child to the correct location defined in the template
		destination.append(child);
	}
	__htmlInitialisation(){}							//fires in order to do all js setup code on the elements
	//native methods that can be tapped into
	connectedCallback(){}								//fires when the element is inserted into the DOM
	disconnectedCallback(){}							//fires when the element is removed from the DOM
	attributeChangedCallback(attrName, oldVal, newVal){}//fires when the value of an attribute changes
	adoptedCallback(){}									//fires when the element has been moved to a new document
	
	
	//method to register the element class so it can be used
	static registerElement(global, elementName, className){
		if(!elementName){
			elementName = this.name.replace(/((?!ElementClass)[A-Z][a-z]+)|ElementClass/g, "$1-").toLowerCase();
			elementName = elementName.substring(0, elementName.length-2);
		}
		if(!className){
			className = this.name.replace(/Class$/,"");
		}
		window.customElements.define(elementName, this);
		var c = window.customElements.get(elementName);
		if(global)
			window[className] = c;
		return c;
	}
};