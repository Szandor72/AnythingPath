({
    buildPath : function(component, event){
        //do we have both prerequisites?
        if (!component.get("v.picklistDone") || !component.get("v.picklistDone")){
            //console.log('not ready yet');
            return;
        }
        
        var options = [];
        var originalOptions = component.get("v.options");
        //console.log(originalOptions);
        var currentValue = component.get("v.currentValue");
        
        var counter=0;
        var foundCurrent = false;
        
        for (var key in originalOptions) { //(value, label)
            if (originalOptions.hasOwnProperty(key)){
                var option = {
                    "label" : originalOptions[key],
                    "value" : key,
                    "index" : counter//,
                    //"ariaSelected" : false,
                    //"tabIndex" : -1
                };
                if (currentValue == null){
                    option.statusClass = 'is-incomplete';
                } else if (!foundCurrent && currentValue != key){
                    option.statusClass = 'is-complete';
                } else if (foundCurrent && currentValue != key){
                    option.statusClass = 'is-incomplete';
                } else if (!foundCurrent && currentValue == key){
                    option.statusClass = 'is-current';
                    //option.ariaSelected = true;
                    //option.tabIndex = 0;
                    foundCurrent = true;

                    
                }

                options.push(option);
                counter = counter + 1;
            }             
        }
        //console.log(options);
        component.set("v.pathObjects", options);
    }
})