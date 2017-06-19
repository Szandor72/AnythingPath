({
	doInit : function(component) {
		let temp = [];
		temp.push(component.get("v.pathField"));
		component.set("v.formattedFields", temp);
	},

	frdgo : function(component, undefined, helper) {
		let pl = component.get("c.getPicklistOptions");
		pl.setParams({
				"recordId" : component.get("v.recordId"),
				"picklistField" : component.get("v.pathField"),
				"sObjectName" : component.get("v.sObjectName")
			});
		pl.setStorable();

		helper.executeAction(component, pl)
			.then($A.getCallback(function(result){
				helper.buildPath(component, result);
			})
		);

	},

	change : function(component, event, helper) {
		if (!component.get("v.clickToChange")) {
			return;
		}

		let fields = component.get("v.fieldsE");
		fields[component.get("v.pathField")] = event.target.title;
		component.set("v.fieldsE", fields);

		component.find("frde").saveRecord($A.getCallback(function(result){
			if (result.state === "SUCCESS" || result.state === "DRAFT") {
				//console.log("updated record");
			} else if (result.state === 'ERROR'){
				component.find("leh").passErrors(result.error);
			}
		}));
	},


})