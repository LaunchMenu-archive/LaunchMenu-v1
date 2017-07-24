loadOnce("/$Utils");
window.$Settings = (function(){
	var fs = require("fs");
	var path = $Utils.dataPath()+"Settings.txt";

	//value functions
	class Category{
		[Symbol.toPrimitive](){
			if(this.value!==undefined)
				return this.value;
			return this.getString();
		}
		addListener(func){
			if(typeof func == "function"){
				if($EventHandler.trigger("addListener:pre", s, {setting: this, listener: func})){
					if(!this._listeners) this._listeners = [];
					this._listeners.push(func);			
					
					$EventHandler.trigger("addListener:post", s, {setting: this, listener: func});
				}
			}
		}
		removeListener(func){
			if(!this._listeners){
				var index = this._listeners.indexOf(func);
				if($EventHandler.trigger("removeListener:pre", s, {setting: this, listener: func, index:index}))
					if(index>-1){
						this._listeners.splice(index, 1);
						$EventHandler.trigger("removeListener:post", s, {setting: this, listener: func, index:index});
					}
			}
		};
	}
	
	//util functions
	Category.prototype.list = function(obj){
		if(!obj) obj = {};
		if(this.value!==undefined)
			obj[this.getPath()] = this;
		
		var keys = Object.keys(this);
		for(var i=0; i<keys.length; i++){
			var key = keys[i];
			if(key[0]!="_"){				
				var val = this[key];
				if(val.list){
					val.list(obj);
				}
			}
		}
		return obj;
	};
	Category.prototype.getAvailableSettings = function(){
		var out = "";
		
		var list = this.list();
		var keys = Object.keys(list);
		
		var l = 0;
		for(var i=0; i<keys.length; i++){
			var key = keys[i];
			l = Math.max(key.length, l);
		}
		for(var i=0; i<keys.length; i++){
			var key = keys[i];
			var val = list[key];
			
			var n = "current value";
			out += key+ " ".repeat(l-key.length)+" "+n+": "+val.value+"\n"; 
			if(val._description)
				out += " ".repeat(l)+" description"+" ".repeat(n.length-"description".length)+": "+val._description+"\n";
			if(val._type)
				out += " ".repeat(l)+" value type"+" ".repeat(n.length-"value type".length)+": "+val._type+"\n";
			if(val._regex)
				out += " ".repeat(l)+" value regex"+" ".repeat(n.length-"value regex".length)+": "+val._regex+"\n";
		}
		return out;
	};
	Category.prototype.getPath = function(from$Settings){			
		var path = this._name;
		if(this._parent){
			if(!from$Settings || this._parent._parent)
				path = this._parent.getPath(from$Settings)+"."+path;
		}
		return path;
	};
	
	//saving functions
	Category.prototype.getValues = function(){
		var obj = {};
		if(this.value!==undefined)
			obj.value = this.value; 
		
		var keys = Object.keys(this);
		for(var i=0; i<keys.length; i++){
			var key = keys[i];
			var val = this[key];
			if(key[0]!="_"){		
				if(val instanceof Category)
					obj[key] = val.getValues();
			}
		}
		return obj;
	};
	Category.prototype.setValues = function(obj){
		if($EventHandler.trigger("setValues:pre", s, {values:obj})){
			var keys = Object.keys(obj);
	
			if(obj.value){
				this.value = obj.value;
				keys.splice(keys.indexOf("value"),1);
			}
					
			for(var i=0; i<keys.length; i++){
				var key = keys[i];
				var val = obj[key];
				this[key].setValues(val);
			}
			$EventHandler.trigger("setValues:post", s, {values:obj});
		}
	};
	Category.prototype.toString = function(){
		return this.getString();
	}
	Category.prototype.getString = function(){
		return JSON.stringify(this.getValues(), null, 4).replace(/\n/g, '\r\n');
	};
	Category.prototype.setString = function(str){
		if($EventHandler.trigger("setString:pre", s, {string:str})){			
			this.setValues(JSON.parse(str));
			$EventHandler.trigger("setString:post", s, {string:str});
		}
	};
	
	//variable validation functions
	var validationFuncs = {
		"regex":function(setting, value){
					if(setting._regex && !value.match(setting._regex))
						return "value must match the regular expression "+setting._regex;
				},
		"type": function(setting, value){
					if(setting._type && typeof(value)!=setting._type)
						return "value must be of type "+setting._type;
				},
		"min":	function(setting, value){
					if(setting._min){
						if(typeof(value)!="number")
							return "value must be of type number";
						if(alue>setting._min)
							return "value must be greater than the minimum "+target._min;
					}
				},
		"max":	function(setting, value){
					if(setting._max){
						if(typeof(value)!="number")
							return "value must be of type number";
						if(value<setting._max)
							return "value must be smaller than the maximum "+target._max;
					}
				}
	};
	var isValueValid = function(setting, value, oldValue){
		var validationTypes = Object.keys(validationFuncs);
		for(var i=0; i<validationTypes.length; i++){
			var type = validationTypes[i];
			var f = validationFuncs[type];
			var val = f(setting, value);
			if($EventHandler.trigger("validateValue:pre", s, {setting:setting, 
															 value:value, 
															 validationType:type, 
															 validationReturn:val, 
															 currentValue:oldValue}) && val){
				console.error(val);
				return false;
			}	
		}
		return true;
	}
	
	//proxy to automatically create sub categories, and fire event listeners on value change
	var createProxy = function(obj){
		return new Proxy(obj, {
			set: function(target, property, value, receiver){
				if(property=="value"){ 				  //when changing the value, send value to all listeners
					var oldValue = target[property]; 
					if($EventHandler.trigger("setValue:pre", s, {setting:target, 
																newValue:value,
																currentValue:oldValue})){
						//check if the value meets all conditions
						if(!isValueValid(target, value, oldValue))
							return;
						
						//set value and events
						target[property] = value;
						if(target._listeners){
							for(var i=0; i<target._listeners.length; i++){
								var f = target._listeners[i];
								f.call(target, value, oldValue);
							}
						}						
						
						$EventHandler.trigger("setValue:post", s, {setting:target, 
																  value:value, 
																  oldValue:oldValue})
					}
				}else if(property[0]=="_"){		      //straight up define any variables that start with a _
					target[property] = value;
				}else if(target[property] instanceof Category || 
						target[property]===undefined){//define the default value of an option, together with its description
					
					if(target[property]===undefined){
						target[property] = createCategory(property, target);
						$EventHandler.trigger("createSetting:post", s, {setting: target[property]});
					}
						
					if(value instanceof Object){
						
						//add all the parameters
						var keys = Object.keys(value);
						for(var i=0; i<keys.length; i++){
							var key = keys[i];
							var val = value[key];
							target[property]["_"+key] = val;
						}
						
						//validate old value, if invalid set value to defaultValue;
						if(value.defaultValue){
							if(target[property].value===undefined || !isValueValid(target[property], target[property].value)){								
								target[property].value = value.defaultValue;
								$EventHandler.trigger("setDefaultValue:post", s, {setting: target[property], value:value.defaultValue});
							}
						}
						
						$EventHandler.trigger("setupSettings:post", s, {setting: target[property]});
					}else{
						target[property].value = value;						
					}
				}
			},
			get: function(target, property, receiver){
				if(property=="value" || target[property]){//if we are trying to access a defined variable or the value, straight up return it
					return target[property];
				}else if(property[0]!="_"){				//make sure we are not trying to access a private property;
					target[property] = createCategory(property, target);
					$EventHandler.trigger("createSetting:post", s, {setting: target[property]});
					return target[property];
				}
			}
		});
	}
	var createCategory = function(name, parent){
		var cat = new Category();
		cat._name = name;
		if(parent)
			cat._parent = parent;
		
		return createProxy(cat);
	}
	
	//saving and loading
	class $Settings extends Category{	
		constructor(){
			super();
			this._name = "$Settings";
		}
		save(){
			if($EventHandler.trigger("save:pre", s, {})){
				var dirname = require("path").dirname(path);
				
				if(!fs.existsSync(dirname)){
					fs.mkdir(dirname);
				}
				console.log(this.getString());
				fs.writeFile(path, this.getString(), function(error) {
					if(error){
						console.error("Settings weren't able to be saved: ", error);
					}else{
						console.info("Settings saved succesfully");
					}
				});				
				$EventHandler.trigger("save:post", s, {});
			}
		};
		load(){
			if($EventHandler.trigger("load:pre", s, {})){
				var t = this;			
				fs.readFile(path, 'utf8', function(error, data){
					if(error){
						console.error("Settings weren't able to load: ", error);
					}else{				
						t.setString(data);
					}
				});
				$EventHandler.trigger("load:post", s, {});
			}
		};
	}
	var s = createProxy(new $Settings());
	return s;
})();