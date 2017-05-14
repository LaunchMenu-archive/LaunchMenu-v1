var Inherit = (function(){
    var classNames = [];
    
    var constructorN = "const";
    var classNameN = "className";
    var parentN = "super";      //the super object
    var parentClassN = "class"; //the original class that the super object was created from
    var classOfN = "classof";
    function Class(name, classObj, parentClass){
        if(typeof name != "string"){
            throw new Error("A name must be provided");
        }
        if(classNames.indexOf(name)!=-1){
            throw new Error("A class with the same name already exists");
        }
        classNames.push(name);
        
        
        /*retrieve the constructor,
        copy parent's constructor if class doesn't contain a constructor,
        create empty constructor if no parent is defined*/
        var innerConstructor = classObj[constructorN];
        var originalConstructor = innerConstructor;
        if(!innerConstructor){
            if(parentClass){
                originalConstructor = parentClass;
                innerConstructor = function(){originalConstructor.apply(this, arguments);};
            }else{
                originalConstructor = function(){};
                innerConstructor = originalConstructor;
            }
        }
        
         /*retrieving the path of extended classes, 
        in order to display when a object is logged*/
        var constructorString = originalConstructor.toString().replace(/((\w*(:| ))*)(function ?\()/, "$4");
        constructorString = name+" "+constructorString;
        var parentStr = "";
        if(parentClass){
            var n = parentClass;
            do{
                parentStr = n[classNameN]+":"+parentStr;
            }while(n.prototype[parentN] && (n = n.prototype[parentN][parentClassN]));
            constructorString = parentStr+constructorString;
        }
        
        var parent = {}; //the super object
        /*the object that is currently executing code, this knowledge is necessairy for executing parent functions*/
        var runningObject; 
        /*setup what the parent of the class of which code is currently executing is*/
        var enterClass = function(obj){
            var prevParent = obj[parentN];
            var prevRunningObject = runningObject;
            obj[parentN] = parent;
            runningObject = obj;
            return [prevParent, prevRunningObject];
        };
        var leaveClass = function(obj, restoreData){
            obj[parentN] = restoreData[0];
            runningObject = restoreData[1];
        };
        
        /*transfer the class name to the constructor (unfortunately through a function eval)*/
        var constructor = Function("func", "return function "+name+"(){return func.apply(this, arguments);}")(function(){
            this.crap=3; 
        	var data = enterClass(this); 
        	/*var stackSoFar = new Error().stack;
        	try{
        	    console.log(name);
    	        innerConstructor.apply(this, arguments);
        	}catch(e){
        	   // console.log(e.stack.match(/((\w+)(([.])const((.+)\n)))((.+)\n){2}/g));
        	    var regex = new RegExp("((\\w+)(([.])"+constructorN+"(.+))\\n)(((?!(.+)(([.]"+constructorN+")|(new))(.+)[(](.+)[)])(.+)[)]|(.+)[(]eval(.+))\\n?)+");
        	    e.stack = e.stack.replace(regex,name+"$3\r\n");
        	    console.log(stackSoFar);
        	    throw e;
        	}finally{
        	    console.log(name);
        	    leaveClass(this,data);
        	}*/
            innerConstructor.apply(this, arguments);
            leaveClass(this,data); 
        });
        /*without name and eval to test the speed impact eval has*/
        // var constructor = function(){
        //     this.crap=3; 
        // 	var data = enterClass(this); 
        //     innerConstructor.apply(this, arguments);
        //     leaveClass(this,data);
        // };
        constructor.toString = function(){return "Class "+constructorString};
        /*add a custom function that acts like instanceof but also works with parent classes*/
        constructor[classOfN] = function(object){
            if(object instanceof constructor) return true;
            while(object[parentN]!=null){
                object = object[parentN];
                if(object[parentClassN] == constructor)
                    return true;
            }
            return false;
        };
        classObj[classNameN] = name;
        
        
        /*retrieve class fields*/
        var classFields = Object.keys(classObj);
        if(parentClass)
            var parentClassFields = Object.keys(parentClass.prototype);
        
        /*loop through fields in order to copy them to the constructor*/
        for(var i=0; i<classFields.length; i++){
            var field = classFields[i];
            var fieldVal = classObj[field];
            if(fieldVal instanceof Function){
                /*set the function to a function that sets currentObject to object
                and run the original defined function*/
                (function(fieldVal){ //store fieldVal in scope
                    var func = function(){
                        var data = enterClass(this);
                        var value =  fieldVal.apply(this, arguments);
                        leaveClass(this, data);
                        return value;
                    };
                    func.toString = function(){return fieldVal.toString()}; //fix the tostring function
                    constructor.prototype[field] = func;
                })(fieldVal);
            }else{
                /*copy non function fields to both the prototype and the original object,
                meaning that this.field aswell as Class.field can be used to retrieve constants
                but 'this.field = value' will create a local copy, where 'Class.field = value' will alter the constant*/
                (function(field){ //store field in scope
                    constructor.prototype[field] = fieldVal;
                    constructor.__defineGetter__(field, function(){
                        return  constructor.prototype[field];
                    });
                    if(field!=classNameN)
                        constructor.__defineSetter__(field, function(value){
                            constructor.prototype[field] = value;
                        });
                })(field);
            }
        }
        
        if(parentClass){
            parent[parentClassN] = parentClass;
            for(var i=0; i<parentClassFields.length; i++){
                var field = parentClassFields[i];
                (function(field){ //encapsulate field as it changes when looping through the fields
                    /*setup the function for Class.parent.field,
                    make it execute the function with currentObject as this*/
                    if(parentClass.prototype[field] instanceof Function){
                        if(field==constructorN){
                            parent[field] = function(){
                                return parentClass.apply(runningObject, arguments);
                            };
                        }else{
                            parent[field] = function(){
                                return parentClass.prototype[field].apply(runningObject, arguments);
                            };
                        }
                    /*define getter and setter to return the value of the parent class*/
                    }else{
                        parent.__defineGetter__(field, function(){
                            return parentClass.prototype[field];
                        });
                        if(field != parentN && field!=classNameN)
                            parent.__defineSetter__(field, function(val){
                                parentClass.prototype[field] = val;
                            });
                    }
                })(field);
                /*add parent field to prototype if it is not defined in class*/
                if(classFields.indexOf(field)==-1)
                    constructor.prototype[field] = parentClass.prototype[field];
            }
            // constructor[parentN] = parent;
            constructor.prototype[parentN] = parent;
        }
        return constructor;
    }
    
    /*create a class and instantiate it right away */
    function Inherit(name, o, c){
        return new (Class(name, o, c))();
    }
    return [Class, Inherit];
})();
var Class = Inherit[0];
var Inherit = Inherit[1];

// var Person = Clas("Person", {
//     const: function(arg1){
//         console.log("Person", arg1, this);
//         this.someFunc();
//     },
//     someFunc: function(){
//         console.log("PersonFunc");
//         (function(){
//             var error = new Error("shit shaun");
//             console.error(error);
//             throw error;
//         })();
//         return 5;
//     },
//     someConstant: 1
// });
// var Child = Clas("Child", {
//     const: function(arg1){
//         this.super.const(arg1);
//         console.log("Child", arg1, this);
//     },
//     someFunc: function(){
//         console.log("ChildFunc");
//         return this.super.someFunc();
//     },
//     someConstant: 2
// }, Person);
// var John = Clas("John", {
//     const: function(arg1){
//         this.super.const(arg1);
//         console.log("John", arg1, this);
//     },
//     someFunc: function(){
//         console.log("JohnFunc");
//         return this.super.someFunc();
//     },
//     someConstant: 3
// }, Child);

// try{
//     var john = new John("arg");
//     john.someFunc();
// }catch(e){
//     console.error(e);
// }

// var Parent = Clas("Parent", {
    
// }, Person);

// var parent = new Parent("shit");
// parent.someFunc();