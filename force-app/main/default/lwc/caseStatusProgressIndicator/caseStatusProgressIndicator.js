import { LightningElement ,api,wire} from 'lwc';
import {getObjectInfo} from 'lightning/uiObjectInfoApi';    
import CASE_OBJECT from '@salesforce/schema/Case';
import STATUS_FIELD from '@salesforce/schema/Case.Status';

export default class CaseStatusProgressIndicator extends LightningElement {
    statusOptions;
    error;
    @api recordId;
    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })objectInfo;
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD })picklistFunction{(data,error)}{
        if(data){
            this.statusOptions = data.values;
        }
        else if(error){
            this.error = error;
            console.error('Error fetching picklist values: ', error);
    }

}