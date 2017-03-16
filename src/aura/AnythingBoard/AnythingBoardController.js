({
	doInit : function(component, event, helper) {

	let self=this;  //let's be clear on what THIS is

	//three apex calls we'll be using
	let getRecords = component.get("c.queryJSON");

	let getOptions = component.get("c.getPicklistOptions");

	helper.buildSoql(component);
	helper.buildDisplayFieldsArray(component);

	getRecords.setParams({"soql" : component.get("v.soql")});

	getRecords.setCallback(self, function(a){

		//deal with the records that came back, organize by the pathField
		let records = JSON.parse(a.getReturnValue());
		let DFA = component.get("v.displayFieldsArray")

		//set the display fields on the records
		_.forEach(records, function(value, key){
			records[key].displayFields = [];
			_.forEach(DFA, function(DFAvalue, DFAkey){
				if (DFAvalue.indexOf(".")>0){
					let splitDFA = DFAvalue.split(".");
					//handling relationship queries
					records[key].displayFields.push(records[key][splitDFA[0]][splitDFA[1]]);
				} else {
					//simple fields
					records[key].displayFields.push(records[key][DFAvalue]);
				}
			})
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
	});

	let params = {
		"recordId" : component.get("v.recordId"),
		"picklistField" : component.get("v.pathField"),
		"sObjectName" : component.get("v.sObjectName")
	};

	getOptions.setParams(params);

	getOptions.setCallback(self, function(a){
		let rawOptions = a.getReturnValue();
		helper.buildEmptyTree(component, rawOptions);
		$A.enqueueAction(getRecords);
	});

	$A.enqueueAction(getOptions);

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