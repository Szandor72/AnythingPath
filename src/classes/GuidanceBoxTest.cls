@isTest
public class GuidanceBoxTest {

    @isTest private static void testGuidanceBoxNoRecTypes(){
        //    public static list<GuidanceBox__c> getGuidance(string recordId, string sobjectname, string field, boolean useRecordTypes){

        case c = new case();
        c.Status = 'Closed';
        insert c;
        system.assertNotEquals(c.Id, null);
        
        GuidanceBox__c gb = new GuidanceBox__c();
        gb.Field__c = 'Status';
        gb.Object__c = 'Case';
        gb.Field_Value__c = 'Closed';
        insert gb;
        system.assertNotEquals(c.Id, null);
        
        list<GuidanceBox__c> GBs = GuidanceBox.getGuidance(c.Id, 'Case', 'Status', false);
        system.debug(GBs);
        
        system.assertEquals(gb.Id, GBs[0].Id);
        
        //trying with record types, might fail and have to recover without them.
        GBs = GuidanceBox.getGuidance(c.Id, 'Case', 'Status', true);

        string topicName = GuidanceBox.dynamicTopic('Case', 'Status');
    } 
}