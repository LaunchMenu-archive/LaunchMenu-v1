loadOnce("$Settings");
(function(){
    window.$SettingValidator = class $SettingValidator{
        static registerValidationType(name, func, requiredValueType){ //register new validation type
            this.validationTypes[name] = {
                func: func
            }
            if(requiredValueType) this.validationTypes[name].type = requiredValueType;
        }
        static validate(value, setting, settingValidationData, isPreSetCheck){
            var validationTypesNames = Object.keys(this.validationTypes);
            //go through all validation names
            for(var i=0; i<validationTypesNames.length; i++){
                var type = validationTypesNames[i];
                var settingTypeValidationData = settingValidationData[type];
                //check if validation data exists in the setting
                if(settingTypeValidationData){                
                    var validation = this.validationTypes[type];
                    //check if the validation type corresponds with the settings type, 
                    //if this is not the case 2 validations have been defined that require different settings types
                    if(validation.type && settingValidationData.type && validation.type!=settingValidationData.type.value && validation.type!=settingValidationData.type){
                        console.error(setting, "You can't define multiple validations that operate on different value types");
                    }else{                
                        var val = validation.func(settingTypeValidationData.value, value, setting);
                        //execute the validation, return an object with data  if the validation was unsuccessful
                        if($EventHandler.trigger("validateValue:pre", $Settings,   {setting: setting, 
                                                                                    value: value, 
                                                                                    typeValidationType: validation, 
                                                                                    validationReturn: val,
                                                                                    isPreSetCheck: !!isPreSetCheck,
                                                                                    currentValue: setting.value}) && val){
                            return {success: false, 
                                    message: settingTypeValidationData.errorMessage||val, 
                                    validationType: validation};
                        }    
                    }
                }
            }
            return {success:true};
        }
    };
    
    window.$SettingValidator.validationTypes = {
        "type":     {
                        func: function(validationValue, value, setting){
                            if(typeof(value)!=validationValue)
                                return "value must be of type "+validationValue;
                        }
                    },
        "regex":    {
                        func: function(validationValue, value, setting){
                            if(!value.match(validationValue))
                                return "value must match the regular expression "+validationValue;
                        },
                        type: "string"
                    },
        "min":      {
                        func: function(validationValue, value, setting){
                            if(value<validationValue)
                                return "value must be greater than or equal to the minimum of "+validationValue;
                        },
                        type: "number"
                    },
        "max":      {
                        func: function(validationValue, value, setting){
                            if(value>validationValue)
                                return "value must be smaller than or equal to the maximum of "+validationValue;
                        },
                        type: "number"
                    },
        "decimals": {
                        func: function(validationValue, value, setting){
                            var n = Math.pow(10, validationValue);
                            if(Math.round(value*n)/n!=value)
                                return "value must have "+validationValue+" decimals";
                        },
                        type: "number"
                    },
        "custom":   {
                        func: function(validationValue, value, setting){
                            return validationValue(value, setting);
                        }
                    }
    };
})();