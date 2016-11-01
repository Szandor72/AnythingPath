public class GuidanceBox {
    
    @AuraEnabled
    public static list<GuidanceBox__c> getGuidance(string recordId, string sobjectname, string field, boolean useRecordTypes){
        
        if (useRecordTypes){
            try{
                sObject sobj = Database.query('select RecordTypeId, ' + field + ' from ' + sobjectname + ' where Id =\'' + recordId + '\'');
            string fieldValue = (string)sobj.get(field);
            Id recType = (Id)sobj.get('RecordTypeId');
            
            return [select Guidance__c from GuidanceBox__c 
                    where object__c =: sobjectname and field__c =: field and Field_Value__c=:fieldValue and RecordType__c =: recType];        	            
            } catch (exception e){
                system.debug('there may not be record types');
            }
        } 
        //I guess you don't want record types!
        
        sObject sobj = Database.query('select ' + field + ' from ' + sobjectname + ' where Id =\'' + recordId + '\'');
        string fieldValue = (string)sobj.get(field);
        
        return [select Guidance__c from GuidanceBox__c 
                where object__c =: sobjectname and field__c =: field and Field_Value__c=:fieldValue] ;
        
    }
    
    //hook into Ora's pre-existing method
    @AuraEnabled
    public static String dynamicTopic(String WhichObject, String Field){
        return Ora.dynamicTopic(WhichObject, Field);
    }
        
        
}