/* globals $ */
({
    doInit : function(component, undefined) {
        //console.log('doing init on streamer');

        // Retrieve the session id and initialize cometd
        let sessionAction = component.get("c.sessionId");

        sessionAction.setCallback(this, function(response) {
            let state = response.getState();
            if(state  === "SUCCESS") {
                let sessionId = response.getReturnValue();
                let authstring = "OAuth " + sessionId;

                //authenticate to the Streaming API
                $.cometd.init({
                    url: window.location.protocol + '//' + window.location.hostname + '/cometd/36.0/',
                    requestHeaders: { Authorization: authstring },
                    appendMessageTypeToURL : false
                });
                $.cometd.subscribe('/topic/'+component.get("v.topic"), function (message){
                    //console.log(message);
                    //console.log(message.data.sobject);
                    let appEvent = $A.get("e.c:StreamerEvent");
					appEvent.setParams({ "message" : message });
					appEvent.fire();
                });

            }
        });
        $A.enqueueAction(sessionAction);
    }
})