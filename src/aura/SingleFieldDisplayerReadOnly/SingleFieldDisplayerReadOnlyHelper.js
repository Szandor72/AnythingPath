({
	addComp : function(component, created) {
		if (component.isValid()) {
        	let body = component.get("v.body");
        	body.push(created);
        	component.set("v.body", body);
        }
	},

    getUserPhotoUrl : function(component, userId){
    	//console.log("firing user photo query");
    	//console.log(userId);
        let query = "select Id, SmallPhotoUrl from User where Id = '"+userId+"'";
        //console.log(query);
        let action = component.get("c.query");
        action.setParams({
            "soql" : query
        });
        action.setCallback(this, function(a){
            let state = a.getState();
            //console.log(state);
            //console.log(a.getReturnValue());
            if (state === "SUCCESS") {

                let response = a.getReturnValue();
                //console.log(response);
                if (response.length===1){

                	$A.createComponent(
						"ltngbase:avatar",
						{
							"src" : response[0].SmallPhotoUrl,
							"letiant" : "circle"
						},
						function (created, status, errorMessage){
							if (component.isValid()) {
					        	let body = component.get("v.body");
					        	body.unshift(created);
					        	component.set("v.body", body);
					        }
					        console.log(status);
					        console.log(errorMessage);
						}
					);

                    //component.set("v.userPhotoUrl", )[0].SmallPhotoUrl);
                } else {
                    console.log('something bad happened getting photo for user ' + userId);
                    console.log(response);
                }
            }  else if (state === "ERROR") {
            	console.log(a.getError());
                let appEvent = $A.get("e.c:handleCallbackError");
                appEvent.setParams({
                    "errors" : a.getError()
                });
                appEvent.fire();
            }
        });
        $A.enqueueAction(action);
    }
})