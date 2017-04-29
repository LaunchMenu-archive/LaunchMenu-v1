/*global $*/
var Inherit = (function(){
    var classes = [];
    
    var constructorName = "const";
    var parentName = "parent";
    var className = "className";
    function Class(name, c1, c2){
        /*shift all arguments if no class name was provided*/
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
        if(!constructor)
            if(c2) constructor = function(){c2.apply(this, arguments)};
            else   constructor = function(){};
            
        /*transfer the class name to the constructor (unfortunately through a function eval)*/
        constructor = new Function("constr","return function "+name+"(){return constr.call(this,arguments);}")(constructor);
        c1[className] = name;
        
        /*retrieve class fields*/
        var classFields = Object.keys(c1);
        if(c2)
            var parentClassFields = Object.keys(c2.prototype);
        
        /*the object of which was last ran a function,
        this is used to determine what Class.parent.someFunction should do,
        as it then knows what object is running the parent function*/
        var currentObject; 
        
        /*loop through fields in order to copy them to the constructor*/
        for(var i=0; i<classFields.length; i++){
            var field = classFields[i];
            var fieldVal = c1[field];
            if(fieldVal instanceof Function){
                /*set the function to a function that sets currentObject to object
                and run the original defined function*/
                fieldVal = (function(fieldVal){
                    return function(){
                        currentObject = this;            
                        return fieldVal.apply(this, arguments);
                    };
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
            var parent = {};
            /*loop through parent fields*/
            for(var i=0; i<parentClassFields.length; i++){
                var field = parentClassFields[i];
                /*setup the function for Class.parent.field,
                make it execute the function with currentObject as this*/
                (function(field){
                    parent[field] = function(){
                        return c2.prototype[field].apply(currentObject, arguments);
                    };
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