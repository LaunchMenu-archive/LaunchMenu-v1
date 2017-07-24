/*global $*/
var lo = 10;
var Inherit = (function(){
    var classes = [];
    
    var constructorName = "const";
    var parentName = "super";
    var parentClassName = "class";
    var className = "className";
    var instanceofName = "instanceof";
    var classofName = "classof";
    function Class(name, c1, c2){
        if(typeof name != "string"){
            throw new Error("A name must be provided");
        }
        if(classes.indexOf(name)!=-1){
            throw new Error("A class with the same name already exists");
        }
        classes.push(name);
        
        /*retrieve the constructor,
        copy parent's constructor if class doesn't contain a constructor,
        create empty constructor if no parent is defined*/
        var constructor = c1[constructorName];
        var orConstructor = constructor;
        if(!constructor)
            if(c2){
                constructor = function(){c2.apply(this, arguments)};
                orConstructor = c2;
            }else{
                constructor = function(){};
                orConstructor = constructor;
            }   
            
        /*retrieving the path of extended classes, 
        in order to display when a object is logged*/
        var constructorString = orConstructor.toString().replace(/((\w*(:| ))*)(function ?\()/, "$4");
        constructorString = name+" "+constructorString;
        var parentStr = "";
        if(c2){
            var n = c2;
            do{
                parentStr = n[className]+":"+parentStr;
            }while(n[parentName] && (n = n[parentName][parentClassName]));
            constructorString = parentStr+constructorString;
        }
        
        /*the parent object that will be added to the class and the object */
        var parent = {};
            
        /*the object of which was last ran a function,
        this is used to determine what Class.parent.someFunction should do,
        as it then knows what object is running the parent function*/
        var currentObject; 
        
        /*transfer the class name to the constructor (unfortunately through a function eval)*/
        var oldConstructor = constructor;
        // console.log(name, constructor);
        constructor = new Function(["constr","f"],
            "return function "+name+`(){
                var prevParent = this.parent;
                f(this);
                var value = constr.apply(this,arguments);
                this.parent = prevParent;
                return value;
            }`)(oldConstructor, function(obj){
                currentObject = obj;
                // console.log(obj, parent.className);
                obj.parent = parent;
            });
        constructor.toString = function(){return "Class "+constructorString};
        c1[className] = name;
        
        /*add a custom instanceof function that also checks super classes */
        // console.log(constructor);
        c1[instanceofName] = function(clas){
            var n = constructor;
            while(n != clas){
                n = n[parentName];
                if(n)   n =n[parentClassName];
                else    return false;
            }
            return true;
        };
        constructor[classofName] = function(object){
            if(this!=constructor) throw new Error("You can only call this function on an class");
            if(object.instanceof==null) return false;
            return object.instanceof(constructor);
        };
        
        
        /*retrieve class fields*/
        var classFields = Object.keys(c1);
        if(c2)
            var parentClassFields = Object.keys(c2.prototype);
        
        
        /*loop through fields in order to copy them to the constructor*/
        for(var i=0; i<classFields.length; i++){
            var field = classFields[i];
            var fieldVal = c1[field];
            if(fieldVal instanceof Function){
                /*set the function to a function that sets currentObject to object
                and run the original defined function*/
                fieldVal = (function(fieldVal){
                    var func = function(){
                        currentObject = this;     
                        var prevParent = this.parent;
                        this.parent = parent;
                            console.log(this, this.parent.className)
                        if(lo--<0) throw Error("stop");
                        var value =  fieldVal.apply(this, arguments);
                        this.parent = prevParent;
                        return value;
                    };
                    func.toString = function(){return fieldVal.toString()}; //fix the tostring function
                    return func;
                })(fieldVal);
                constructor.prototype[field] = fieldVal;
            }else{
                /*copy non function fields to both the prototype and the original object,
                meaning that this.field can be used to retrieve constants and
                Class.field can be used as static values*/
                constructor.prototype[field] = fieldVal;
                constructor[field] = fieldVal;
            }
        }
        
        
        
        /*inherit parent fields*/
        if(c2){
            parent[parentClassName] = c2;
            /*loop through parent fields*/
            for(var i=0; i<parentClassFields.length; i++){
                var field = parentClassFields[i];
                (function(field){ //encapsulate field as it changes when looping through the fields
                    /*setup the function for Class.parent.field,
                    make it execute the function with currentObject as this*/
                    if(c2.prototype[field] instanceof Function){
                        parent[field] = function(){
                            console.log(parent.className, currentObject.parent.className);
                            return c2.prototype[field].apply(currentObject, arguments);
                        };
                        parent[field].toString = function(){
                            return parentStr+c2.prototype[field].toString();
                        };
                    /*define getter and setter to return the value of the parent class*/
                    }else{
                        parent.__defineGetter__(field, function(){
                            return c2[field];
                        });
                        parent.__defineSetter__(field, function(val){
                            c2[field] = val;
                        });
                    }
                })(field);
                /*add parent field to prototype if it is not defined in class*/
                if(classFields.indexOf(field)==-1)
                    constructor.prototype[field] = c2.prototype[field];
            }
            constructor[parentName] = parent;
            constructor.prototype[parentName] = parent;
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