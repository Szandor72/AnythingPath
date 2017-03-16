({
	doInit : function(component, event, helper) {

	let self=this;  //let's be clear on what THIS is
	let describe;
	//three apex calls we'll be using
	let getRecords = component.get("c.queryJSON");
	let getDescribe = component.get("c.describe");
	//let getOptions = component.get("c.getPicklistOptions");

	helper.buildSoql(component);
	helper.buildDisplayFieldsArray(component);

	getRecords.setParams({"soql" : component.get("v.soql")});

	getRecords.setCallback(self, function(a){

		if (a.getState() === 'SUCCESS'){
			//deal with the records that came back, organize by the pathField
			let records = JSON.parse(a.getReturnValue());
			let DFA = component.get("v.displayFieldsArray");
			console.log(records);

			//set the display fields on the records
			_.forEach(records, function(record, key){
				records[key].displayFields = [];
				_.forEach(DFA, function(DFAvalue){
					if (DFAvalue.indexOf(".")>0){
						let splitDFA = DFAvalue.split(".");
						//original handling relationship queries
						//records[key].displayFields.push(records[key][splitDFA[0]][splitDFA[1]]);
						//let's ask about this object, and push the result on callback
						//returns something like "/services/data/v39.0/sobjects/User/00541000000o5HqAAI"
						let url = records[key][splitDFA[0]].attributes.url;
						console.log(url);
						//regex to rip stuff out of that URL field.  Will include __c if it exists
						let relatedObjectName = url.match('/sobjects/(.*)/')[1];
						console.log(relatedObjectName);
						let getRelatedDescribe = component.get("c.describe");
						getRelatedDescribe.setStorable();
						getRelatedDescribe.setParams({"objtype" : relatedObjectName});
						getRelatedDescribe.setCallback(self, function(a){
							if (a.getState() === "SUCCESS") {
								//save that for use later
								let relatedDescribe = JSON.parse(a.getReturnValue());
								//component.set("v.describe", describe);
								console.log(relatedDescribe);


								//find the record that matches
								let treeToUpdate = component.get("v.options");
								let treeToTraverse = component.get("v.options");
								_.forEach(treeToTraverse, function(option, optionKey){
									//console.log(option.name + ' / ' + record[component.get("v.pathField")]);
									//is it the right path value?
									if (option.name === record[component.get("v.pathField")]){
										//console.log("is option match");
										_.forEach(option.records, function(localRecord, localRecordKey){
											//console.log(localRecord.Id + ' / ' + record.Id);
											//is it the right record?
											if (localRecord.Id === record.Id){
												//console.log("is record match");
												_.forEach(localRecord.displayFields, function (displayField,displayFieldKey){
													//console.log(displayField.fieldDescribe.original + ' / ' + DFAvalue);
													if (displayField.fieldDescribe.original === DFAvalue ){
														//console.log("is field match");
														treeToUpdate[optionKey].records[localRecordKey].displayFields[displayFieldKey].fieldDescribe.describe = _.find(relatedDescribe.fields, {'name' : splitDFA[1]});
														console.log(treeToUpdate);
														component.set("v.options", treeToUpdate);
														//displayField.fieldDescribe.describe = relatedDescribe;
													}
												});
											}
										});
									}
								});



							} else if (a.getState() === "ERROR"){
								let appEvent = $A.get("e.c:handleCallbackError");
					      appEvent.setParams({
					          "errors" : a.getError(),
					          "errorComponentName" : "anythingBoard"
					      });
					      appEvent.fire();
							}
						});
						$A.enqueueAction(getRelatedDescribe);
						//we push something as a placeholder.  We'll update this from the callback.
						records[key].displayFields.push({
								"fieldDescribe" : {
									"describe" : null,
									"original" : DFAvalue,
									"related" : true
								},
								"record" : records[key]
						});
					} else {

						//simple fields
						//old value-only verion
						//records[key].displayFields.push(records[key][DFAvalue]);
						//new object-based version
						records[key].displayFields.push({
							"fieldDescribe" : {
								"describe" : _.find(describe.fields, {'name' : DFAvalue}),
								"original" : DFAvalue
							},
							"record" : records[key]
						});
					}
				});
			});


			let tree = component.get("v.options");
			let grouped = _.groupBy(records, component.get("v.pathField"));


			_.forEach(tree, function(value, key) {
				tree[key].records = grouped[value.name] || [];
				if (grouped[value.name]){
					tree[key].recordCount = grouped[value.name].length;
				} else {
					tree[key].recordCount = 0;
				}

			});
			console.log(tree);
			component.set("v.options", tree);

			//only execute if drag-->change is allowed
			if (component.get("v.dragToChange")){
				helper.dragulaInit(component);
			}
		} else if (a.getState() === "ERROR"){
			console.log(a.getError());
			let appEvent = $A.get("e.c:handleCallbackError");
      appEvent.setParams({
          "errors" : a.getError(),
          "errorComponentName" : "anythingBoard"
      });
      appEvent.fire();
		}
	});

	/*getOptions.setParams({
		"recordId" : null,
		"picklistField" : component.get("v.pathField"),
		"sObjectName" : component.get("v.sObjectName")
	});
	getOptions.setStorable(); //cache this!

	getOptions.setCallback(self, function(a){
		let rawOptions = a.getReturnValue();
		helper.buildEmptyTree(component, rawOptions);
		$A.enqueueAction(getRecords);
	});
	$A.enqueueAction(getOptions);*/

	//switching to my common describe model?
	getDescribe.setParams({
		"objtype" : component.get("v.sObjectName")
	});
	getDescribe.setStorable();
	getDescribe.setCallback(self, function(a){
		if (a.getState() === "SUCCESS") {
			//save that for use later
			describe = JSON.parse(a.getReturnValue());
			component.set("v.describe", describe);
			console.log(describe);
			//now, get the picklist that we need for the stages
			let rawOptions = _.find(describe.fields, {'name' : component.get("v.pathField")}).picklistOptions;
			console.log(rawOptions);
			//then pass that to the tree builder
			helper.buildEmptyTree2(component, rawOptions);

			$A.enqueueAction(getRecords);
		} else if (a.getState() === "ERROR"){
			let appEvent = $A.get("e.c:handleCallbackError");
      appEvent.setParams({
          "errors" : a.getError(),
          "errorComponentName" : "anythingBoard"
      });
      appEvent.fire();
		}
	});
	$A.enqueueAction(getDescribe);

},

navToRecord : function(component, event){

	let recordId = event.target.id;
	let navEvt = $A.get("e.force:navigateToSObject");
	navEvt.setParams({
		"recordId": recordId
	});
	navEvt.fire();
}


})