({
	doInit : function(component) {
		
		var query = component.get("c.getGuidance");        
		var params = {
			"recordId" : component.get("v.recordId"), 
			"sobjectname" : component.get("v.sObjectName"),                     
			"field" : component.get("v.field"),  
			"useRecordTypes" : component.get("v.useRecordTypes")            
		};

		query.setParams(params);
		query.setCallback(this, function(a){
			
			if (a.getState() === "ERROR"){
				var appEvent = $A.get("e.c:handleCallbackError");
				appEvent.setParams({
					"errors" : a.getError(),
					"errorComponentName" : "guidanceBox"
				});
				appEvent.fire();
				return;                        
			} else if (a.getState() === "SUCCESS") {  
				//console.log(a.getReturnValue());                      
				//reflect the change in the path component
				component.set("v.guidances", a.getReturnValue()); 

				var getTopic = component.get("c.dynamicTopic");

				getTopic.setParams({
					"WhichObject" : component.get("v.sObjectName"), 
					"Field" : component.get("v.field")
				});
				getTopic.setCallback(this, function(b){

					//create a streamer dynamically with given topicName
					var topicName = b.getReturnValue();
			
					//TODO: dealing with failure!
					$A.createComponent(
						"c:Streamer", 
						{"topic" : topicName },
						function (topicAdded, status){
							
							if (component.isValid()) {
								var body = component.get("v.body");
								body.push(topicAdded);
								component.set("v.body", body);
							}
						}
						);
				});
				$A.enqueueAction(getTopic);
						
			}	
		});
		$A.enqueueAction(query);
	},

	listener : function(component, event, helper) {
		var message = event.getParam("message");
		var recordId = message.data.sobject.Id;
		var value = message.data.sobject[component.get("v.field")];

		if (recordId === component.get("v.recordId")){
			
			var query = component.get("c.getGuidance");        
			var params = {
				"recordId" : component.get("v.recordId"), 
				"sobjectname" : component.get("v.sObjectName"),                     
				"field" : component.get("v.field"),  
				"useRecordTypes" : component.get("v.useRecordTypes")            
			};

			query.setParams(params);
			query.setCallback(this, function(a){
				//console.log(a.getReturnValue());
				component.set("v.guidances", a.getReturnValue());
			});
			$A.enqueueAction(query);
		}
	}
})