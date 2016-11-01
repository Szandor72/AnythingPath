@isTest
private class OraTest {
	
	@isTest 
	static void testDynamicTopic(){
		Ora.dynamicTopic('Case', 'Status');
	}

	@isTest 
	static void testgetPicklistOptions(){
		list<case> cases = [select id from Case];
		Ora.getPicklistOptions(cases[0].id, 'Status', 'Case');
	}

	@isTest 
	static void testGetCurrentValue(){
		list<case> cases = [select id from Case];
		Ora.getCurrentValue(cases[0].id, 'Status', 'Case');
	}

	@isTest 
	static void testSetNewValue(){
		list<case> cases = [select id from Case];
		Ora.setNewValue(cases[0].id, 'Status', 'Closed');
	}

	@isTest
	static void itShouldReturnSessionId(){
		string sid = Ora.sessionId();
		system.assertNotEquals(sid, null);		
	}

	@isTest static void testQuery() {
		Ora.query('select id from case');
	}
	
	@isTest static void testDescribe() {
		Ora.describe('Case');
	}
	
    @isTest static void testPlural(){
    	Ora.whatsMyPlural('Case');    
    }
    
    @isTest static void testBadDescribe() {
		Ora.describe('YourMom');
	}
    
	@isTest static void testUpdate() {
		list<case> cases = [select id from Case];
		Ora.updateField(cases[0].Id, 'Subject', 'your software REALLY sucks');
	}
    
    @isTest static void testCreate(){        
       	String fields = '{"Name": "TestName"' +
		                    ',"AccountNumber" : "327823782"' + 
            ',"AnnualRevenue" : 2500' +
            ',"Rating" : "Hot" ' +
            ',"Fax" : "5558957842" ' + 
		                    '}';
        system.debug(fields);
        string result = Ora.create('Account', fields);
        system.debug(result);
    }
    
    @isTest static void testBadFieldCreate(){        
       	String fields = '{"Name": "TestName"' +
		                    ',"NoOneWouldEverNameAFieldThis__c" : "327823782"' + 
            ',"AnnualRevenue" : 2500' +
            ',"Rating" : "Hot" ' +
            ',"Fax" : "5558957842" ' + 
		                    '}';
        system.debug(fields);
        string result = Ora.create('Account', fields);
        system.debug(result);
    }
    
    @isTest static void testUnsetableFieldCreate(){        
       	String fields = '{"Name": "TestName"' +
            ',"CreatedDate" : 2500' +
            ',"Rating" : "Hot" ' +
            ',"Fax" : "5558957842" ' + 
		                    '}';
        system.debug(fields);
        string result = Ora.create('Account', fields);
        system.debug(result);
    }
    
    /* Fails in SDOs because of callout trigger / IFTTT app
    @isTest static void testOpptyUpdates() {
		list<opportunity> opptys = [select id from opportunity];
		Ora.updateField(opptys[0].Id, 'Amount', '6.25');
		Ora.updateField(opptys[0].Id, 'Probability', '0.75');        
	}*/
     
    @isTest static void testUpdateCurrency() {
		list<Lead> leads = [select id from Lead];
		Ora.updateField(leads[0].Id, 'AnnualRevenue', '87');
	} 
    
    @isTest static void testUpdateInteger() {
		list<Lead> leads = [select id from Lead];
		Ora.updateField(leads[0].Id, 'NumberOfEmployees', '13');
	}
    
    //public static Schema.DisplayType getFieldType(string objectName, string fieldname){
    @isTest static void testFieldDescribe(){
        Ora.getFieldType('Case', 'Status');
    }
       
	@testSetup static void testSetupCoreObjects() {
        case c = new case();
        c.status = 'New';
        c.Subject = 'your software sucks';
        insert c;
        
        lead l = new lead();
        l.lastname = 'McLaughlin';
        l.Company = 'Pollos Hermanos';
        insert l;
        
        account a = new account();
        a.name = 'Pizza King';
        insert a;
        
        /*opportunity o = new opportunity();
        o.name = 'Pizza King Oppty';
        o.AccountId = a.Id;
        o.CloseDate = system.today();
        o.StageName = 'New';
        insert o;*/
    }
	
}