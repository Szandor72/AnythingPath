**Adds sales-path like visualization to any custom object, where the stages are a picklist field.**

Now includes AnythingBoard (kanban-like drag and drop for custom object status).

Tongue-in-cheek [demo video](https://www.youtube.com/watch?v=Zoqll5THApU) that was done for internal Salesforce humor.

<a href="https://githubsfdeploy.herokuapp.com?owner=mshanemc&repo=AnythingPath">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/src/main/webapp/resources/img/deploy.png">
</a>

## AnythingPath

### Does

* show the stages, in the order of the picklist
* work on standard or custom objects
* have an option to let you change the value by clicking on a stage
* let you change the picklist field in App Builder/Community Builder
* work in Community Templates (Napili, etc) but you have to also tell it which object (Something__c)
* have a whole bunch of use within Salesforce
* display errors, including validation rule errors
* update the path if you do "edit" on the record detail (except in communities, where there's no streaming API)
* verify that your field in app builder is actually a field, and shows an angry red error message if the field isn't found :)

### Doesn't

* verify that it's actually a picklist field
* deal with record types where only some picklist values are there
* have the fields or "guidance for success" stuff that real sales path has
* come with any guarantees from Salesforce or support from me.  Treat this as code you found laying beside the road.

===

## GuidanceBox

GuidanceBox provides the "Guidance for Success" to immitate Sales Path.  Behind it is a custom object with a rich text field for guidance, along with text fields for

* what object the guidance should show up on
* what field drives the guidance
* what value the guidance matches
* optionally, what recordTypeId the guidance is for (in case different record types have different guidance at the same field/value)

There's a simple lightning component to drag onto your record detail page.  If no guidance exists for the given object/field/recordtype, the component just hides itself.

===

## AnythingBoard

### Does

* show the stages, in the order of the picklist
* work on standard or custom objects
* show as many fields as you like
* support "related list" like features--you can limit the records returned to children of the current record displayed
* have a checkbox that lets you add the field labels to the cards
* support lookup/related fields on the cards

### Doesn't

* do any rollup/count/sum of any fields, just counts the objects
* verify that it's actually a picklist field
* verify that it's actually a field at all :)
* deal with record types where only some picklist values are there
* have any error handling (if you change to a value that's throwing an exception due to triggers or validation rules, you see NOTHING!)
* come with any guarantees from Salesforce or support from me.  Treat this as code you found laying beside the road.