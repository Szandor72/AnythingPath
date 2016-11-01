({
	doInit : function(component, event, helper) {

	var self=this;  //let's be clear on what THIS is

	//three apex calls we'll be using
	var getRecords = component.get("c.queryJSON");
	
	var getOptions = component.get("c.getPicklistOptions");        

	helper.buildSoql(component);
	helper.buildDisplayFieldsArray(component);

	getRecords.setParams({"soql" : component.get("v.soql")});

	getRecords.setCallback(self, function(a){        	

		//deal with the records that came back, organize by the pathField
		var records = JSON.parse(a.getReturnValue());
		var DFA = component.get("v.displayFieldsArray")
		
		//set the display fields on the records
		_.forEach(records, function(value, key){
			records[key].displayFields = [];
			_.forEach(DFA, function(DFAvalue, DFAkey){
				if (DFAvalue.indexOf(".")>0){
					var splitDFA = DFAvalue.split(".");
					//handling relationship queries
					records[key].displayFields.push(records[key][splitDFA[0]][splitDFA[1]]);
				} else {
					//simple fields
					records[key].displayFields.push(records[key][DFAvalue]);            		            			
				}
			})
		});


		var tree = component.get("v.options");
		var grouped = _.groupBy(records, component.get("v.pathField"));
		

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

	var params = {
		"recordId" : component.get("v.recordId"),
		"picklistField" : component.get("v.pathField"),
		"sObjectName" : component.get("v.sObjectName")            
	};

	getOptions.setParams(params);

	getOptions.setCallback(self, function(a){
		var rawOptions = a.getReturnValue();
		helper.buildEmptyTree(component, rawOptions);
		$A.enqueueAction(getRecords);	            
	});

	$A.enqueueAction(getOptions);        

},

navToRecord : function(component, event){

	var recordId = event.target.id;
	var navEvt = $A.get("e.force:navigateToSObject");
	navEvt.setParams({
		"recordId": recordId
	});
	navEvt.fire();
}


})