({
	buildSoql : function(component) {
		let helper = this;
		let field = component.get("v.pathField");

		let displayFields = component.get("v.displayFields");
		let exclude1 = component.get("v.excludePicklistValuesFromTiles");
		let exclude2 = component.get("v.excludePicklistValuesFromBoard");
		let relationship = component.get("v.relationshipField");
		let recordId = component.get("v.recordId");

		//safe to remove all space because it's field API names
		let displayFieldsArray = displayFields.replace(/\s/g, '').split(",");
		let queryFields = _.join(_.union(displayFieldsArray, [field], ["Id"]), ", ");

		let soql = "select " + queryFields + " from " + component.get("v.sObjectName");

		//checking for any exclusion
		if (helper.populated(exclude1) || helper.populated(exclude2)){
			let excludeString1, excludeString2 = [];
			if (helper.populated(exclude1)){
				excludeString1 = this.CSL2Array(exclude1);
			}
			if (helper.populated(exclude2)){
				excludeString2 = this.CSL2Array(exclude2);
			}

			//non-redundant array of all the fields to exclude
			let excludeString = _.union(excludeString1, excludeString2);

			excludeString = "'" + excludeString.join("', '") + "'";

			soql = soql + " where " + field + " NOT IN (" + excludeString + ")";
			//relationshiop queries
			if (helper.populated(relationship) && helper.populated(recordId)){
				soql = soql + " and " + relationship + " ='" + recordId +"'" ;
			}
		}

		console.log(soql);

		component.set("v.soql", soql);

	},

	populated : function(input) {
		if (input !== null && input !== '' && typeof input != 'undefined'){
			return true;
		} else {return false;}
	},

	buildEmptyTree2: function(component, rawOptions) {
		let output = [];
		let helper = this;
		let excludeArray = helper.CSL2Array(component.get("v.excludePicklistValuesFromBoard"));

		_.forEach(rawOptions, function(option){
				//console.log(value);
				if (!_.includes(excludeArray, option.label)){
					output.push({
						"name" : option.label,
      			"value" : option.value,
      			"records" : []
					});
				} else {
					//console.log("not found " + value);
				}
			});
			component.set("v.options", output);
	},

	/*buildEmptyTree: function(component, rawOptions) {
			let output = [];
			let helper = this;
			let excludeArray = helper.CSL2Array(component.get("v.excludePicklistValuesFromBoard"));
			//console.log(excludeArray)
			//loop through the rawOptions, if not in the exclude string, push the option
			_.forEach(rawOptions, function(value, key){
				//console.log(value);
				if (!_.includes(excludeArray, value)){
					output.push({
						"name" : value,
            			"value" : key,
            			"records" : []
					});
				} else {
					//console.log("not found " + value);
				}
			})
			component.set("v.options", output);
	},*/

	buildDisplayFieldsArray: function (component){
		//console.log("buildind DFA");
		component.set("v.displayFieldsArray", this.CSL2Array(component.get("v.displayFields")));
	},

	//shared by lots of functions.  You give it a comma-separated list of stuff, it returns a trimmed array
	CSL2Array: function (CSL){

		try{
			let outputArray = CSL.split(",");
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
		let self = this;
		let updateCall = component.get("c.updateField");

		//take the <ul> and make them into Dragula containers
			// AND set the target function
			let DBs = [].slice.call(document.querySelectorAll(".dragulaBox"));
			let drake = dragula(DBs, {
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
							let toastEvent = $A.get("e.force:showToast");
							toastEvent.setParams({
								"title": "Success:",
								"message": 'Record Updated to ' + target.id,
								"type": "success"
							});
							toastEvent.fire();

							//remove my local dom manipulation. We'll do it for real in the data just below
							let parent = document.getElementById(target.id);
							let original = document.getElementById(source.id);
							let child = document.getElementById(el.id);
							//let sibling = document.getElementById(sibling.id);
							// console.log("original");
							// console.log(original);
							// console.log("parent");
							// console.log(parent);
							// console.log("child");
							// console.log(child);
							parent.removeChild(child);

							//move the record in the actual data model
							let data = component.get("v.options");

							let recordToMove = _.find(_.find(data, {'value' : source.id}).records, {'Id': el.id});
							let stepIndexFrom =   _.findIndex(data, {'value' : source.id});
							let movingIndex = _.findIndex(_.find(data, {'value' : source.id}).records, {'Id': el.id});
							// console.log("stepIndexFrom is " + stepIndexFrom);
							// console.log("recordIndexFrom is " + movingIndex);

							// console.log("move record");
							// console.log(recordToMove);
							//change the actual value!
							recordToMove[component.get("v.pathField")] = target.id;

							// console.log("before splice");
							// console.log(data[stepIndexFrom].records);
							let temp = data[stepIndexFrom].records;
							//this removes 1 record from the found original position
							temp.splice(movingIndex, 1);

							// console.log("after splice");
							data[stepIndexFrom].records = temp;
							// console.log(data[stepIndexFrom].records);

							let stepIndexTo = _.findIndex(data, {'value' : target.id});
							// console.log("stepIndexTo is " + stepIndexTo);

							let splicePoint;
							try {
								splicePoint = _.findIndex(_.find(data, {'value' : target.id}).records, {'Id': sibling.id});
							} catch (err){
								splicePoint = 0;
							}
							if (data[stepIndexTo].records.length>0){ //if there are any, call unshift
								// console.log('target step has records');
								let temp = data[stepIndexTo].records;
								//old version--used to put at top.  Now, splice into correct location
								//temp.unshift(recordToMove);
								temp.splice(splicePoint, 0, recordToMove);
								data[stepIndexTo].records = temp;
								// console.log(data[stepIndexTo].records);
							} else {
								// console.log('target step has no records.  Starting one');
								let temp = [];
								temp.push(recordToMove);
								data[stepIndexTo].records = temp;
							}
							// console.log(data);
							component.set("v.options", data);

						} else if (a.getState() === "ERROR"){

							let parent = document.getElementById(target.id);
							let child = document.getElementById(el.id);
							parent.removeChild(child);
							let newParent = document.getElementById(source.id);
							newParent.appendChild(child);

							let appEvent = $A.get("e.c:handleCallbackError");
	                        appEvent.setParams({
	                            "errors" : a.getError(),
	                            "errorComponentName" : "anythingBoard"
	                        });
	                        appEvent.fire();

						}
					});


					if (component.isValid()){
						$A.enqueueAction(updateCall);
					}
				}));
	}
})