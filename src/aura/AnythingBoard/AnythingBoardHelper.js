({
	buildSoql : function(component) {
		var field = component.get("v.pathField");

		var displayFields = component.get("v.displayFields");
		var exclude1 = component.get("v.excludePicklistValuesFromTiles");
		var exclude2 = component.get("v.excludePicklistValuesFromBoard");

		//safe to remove all space because it's field API names
		var displayFieldsArray = displayFields.replace(/\s/g, '').split(",")
		var queryFields = _.join(_.union(displayFieldsArray, [field], ["Id"]), ", ");


		var soql = "select " + queryFields + " from " + component.get("v.sObjectName"); 

		//checking for any exclusion		
		if ((exclude1 != null && exclude1 != '') || (exclude2 != null && exclude2 != '')){
			var excludeString1, excludeString2 = [];
			if (exclude1 != null && exclude1 != ''){
				excludeString1 = this.CSL2Array(exclude1);
			} 
			if (exclude2 != null && exclude2 != ''){
				excludeString2 = this.CSL2Array(exclude2);
			}
			
			//non-redundant array of all the fields to exclude
			var excludeString = _.union(excludeString1, excludeString2);

			excludeString = "'" + excludeString.join("', '") + "'";
			//console.log(excludeString);

			soql = soql + " where " + field + " NOT IN (" + excludeString + ")"
		}
		
		//console.log(soql);

		component.set("v.soql", soql);
			
	},

	buildEmptyTree: function(component, rawOptions) {
			var output = [];
			var helper = this;
			var excludeArray = helper.CSL2Array(component.get("v.excludePicklistValuesFromBoard"));
			//console.log(excludeArray)
			//loop through the rawOptions, if not in the exclude string, push the option
			_.forEach(rawOptions, function(value, key){
				//console.log(value);
				if (!_.includes(excludeArray, value)){
					output.push({
						"name" : value, 
            			"value" : key,
            			"records" : []
					})
				} else {
					//console.log("not found " + value);
				}
			})
			component.set("v.options", output)
			/*
			console.log("building tree");
			var localStuff = rawOptions;

			console.log(localStuff);

			//exclusion process

			var excludeString = component.get("v.excludePicklistValuesFromBoard");
			console.log(excludeString);

			if (excludeString != null && excludeString != ''){
				excludeString = this.CSL2Array(excludeString);
				console.log(excludeString);

				_.forEach(excludeString, function(value, key){
					console.log("removing " + value);
					delete localStuff[value];
					//_.unset(localStuff, value);
					//var removed = _.pull(localStuff, value);
					//console.log(removed);
				})
				console.log(localStuff);
			}


            var output = [];
            for (var key in localStuff) { //(value, label)
            	if (localStuff.hasOwnProperty(key)){
            		output.push({
            			"name" : localStuff[key], 
            			"value" : key,
            			"records" : []
            		});
            	}
            }

            component.set("v.options", output);*/

	},

	buildDisplayFieldsArray: function (component){
		//console.log("buildind DFA");
		component.set("v.displayFieldsArray", this.CSL2Array(component.get("v.displayFields")));
	},

	//shared by lots of functions.  You give it a comma-separated list of stuff, it returns a trimmed array
	CSL2Array: function (CSL){

		try{
			var outputArray = CSL.split(",");
			_.forEach(outputArray, function (value, key){
				outputArray[key] = _.trim(value);
			});
			return outputArray;
		} catch (err){
			return [];
		}
	},

	dragulaInit: function (component){
		//console.log("doing dragula init");
		var self = this;
		var updateCall = component.get("c.updateField");

		//take the <ul> and make them into Dragula containers
			// AND set the target function
			var DBs = [].slice.call(document.querySelectorAll(".dragulaBox"));
			var drake = dragula(DBs, {
				revertOnSpill: true
			}).on("drop", $A.getCallback(function (el, target, source, sibling){
					/*if (target.id === source.id) {
						return;
					}*/
					updateCall.setParams({
						"recordId" : el.id,
						"Field" : component.get("v.pathField"),
						"newValue" : target.id
					});
					updateCall.setCallback(self, function(a){
						if (a.getState() === "SUCCESS") {       
							var toastEvent = $A.get("e.force:showToast");                 
							toastEvent.setParams({
								"title": "Success:",
								"message": 'Record Updated to ' + target.id,
								"type": "success"
							});
							toastEvent.fire();
							
							//remove my local dom manipulation. We'll do it for real in the data just below
							var parent = document.getElementById(target.id);
							var original = document.getElementById(source.id);
							var child = document.getElementById(el.id);
							//var sibling = document.getElementById(sibling.id);
							// console.log("original");
							// console.log(original);
							// console.log("parent");
							// console.log(parent);
							// console.log("child");
							// console.log(child);
							parent.removeChild(child);

							//move the record in the actual data model
							var data = component.get("v.options");

							var recordToMove = _.find(_.find(data, {'value' : source.id}).records, {'Id': el.id});
							var stepIndexFrom =   _.findIndex(data, {'value' : source.id});
							var movingIndex = _.findIndex(_.find(data, {'value' : source.id}).records, {'Id': el.id});
							// console.log("stepIndexFrom is " + stepIndexFrom);
							// console.log("recordIndexFrom is " + movingIndex);

							// console.log("move record");
							// console.log(recordToMove);
							//change the actual value!
							recordToMove[component.get("v.pathField")] = target.id;

							// console.log("before splice");
							// console.log(data[stepIndexFrom].records);
							var temp = data[stepIndexFrom].records;
							//this removes 1 record from the found original position							
							temp.splice(movingIndex, 1);

							// console.log("after splice");
							data[stepIndexFrom].records = temp;
							// console.log(data[stepIndexFrom].records);

							var stepIndexTo = _.findIndex(data, {'value' : target.id});
							// console.log("stepIndexTo is " + stepIndexTo);

							var splicePoint;
							try {
								splicePoint = _.findIndex(_.find(data, {'value' : target.id}).records, {'Id': sibling.id});
							} catch (err){
								splicePoint = 0;
							}
							if (data[stepIndexTo].records.length>0){ //if there are any, call unshift
								// console.log('target step has records');
								var temp = data[stepIndexTo].records;
								//old version--used to put at top.  Now, splice into correct location
								//temp.unshift(recordToMove);	
								temp.splice(splicePoint, 0, recordToMove);
								data[stepIndexTo].records = temp;
								// console.log(data[stepIndexTo].records);							
							} else {
								// console.log('target step has no records.  Starting one');
								var temp = [];
								temp.push(recordToMove);
								data[stepIndexTo].records = temp;
							}
							// console.log(data);
							component.set("v.options", data);								

						} else if (a.getState() === "ERROR"){

							var parent = document.getElementById(target.id);
							var child = document.getElementById(el.id);
							parent.removeChild(child);
							var newParent = document.getElementById(source.id);
							newParent.appendChild(child);

							var appEvent = $A.get("e.c:handleCallbackError");
	                        appEvent.setParams({
	                            "errors" : a.getError(),
	                            "errorComponentName" : "anythingBoard"
	                        });
	                        appEvent.fire(); 
							
						}
					});


					if (component.isValid()){
						$A.enqueueAction(updateCall)
					}
				}));  
	}
})