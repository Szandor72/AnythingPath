({
	buildPath : function(component, picklistOptions) {
		var counter=0;
    var foundCurrent = false;
    let pathObjects = [];

    var actualValue = component.get("v.fields")[component.get("v.pathField")];

    for (var key in picklistOptions) { //(value, label)
      if (picklistOptions.hasOwnProperty(key)){
        var option = {
            "label" : picklistOptions[key],
            "value" : key,
            "index" : counter//,
            //"ariaSelected" : false,
            //"tabIndex" : -1
        };
        if (actualValue == null){
            option.statusClass = 'is-incomplete';
        } else if (!foundCurrent && actualValue != key){
            option.statusClass = 'is-complete';
        } else if (foundCurrent && actualValue != key){
            option.statusClass = 'is-incomplete';
        } else if (!foundCurrent && actualValue == key){
            option.statusClass = 'is-current';
            //option.ariaSelected = true;
            //option.tabIndex = 0;
            foundCurrent = true;
        }

        pathObjects.push(option);
        counter++;
      }
  	}

  	component.set("v.pathObjects", pathObjects);
	}
})