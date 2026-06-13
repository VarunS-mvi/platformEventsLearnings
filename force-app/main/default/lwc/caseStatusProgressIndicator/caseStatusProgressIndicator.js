import { LightningElement ,api,wire} from 'lwc';
import {getObjectInfo,getPicklistValues} from 'lightning/uiObjectInfoApi';    
import {getRecord, updateRecord} from 'lightning/uiRecordApi';
import CASE_OBJECT from '@salesforce/schema/Case';
import STATUS_FIELD from '@salesforce/schema/Case.Status';
import CASE_ID_FIELD from '@salesforce/schema/Case.Id';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from "lightning/empApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';


export default class CaseStatusProgressIndicator extends LightningElement {
    statusOptions;
    currentCaseStatus;
    error;
    @api recordId;
    channelName = "/event/Case_Details__e";
  isSubscribeDisabled = false;
  isUnsubscribeDisabled = !this.isSubscribeDisabled;
  subscription = {};

    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })objectInfo;
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD })picklistFunction({data,error}){
        if(data){
          
            this.statusOptions = data.values;
            console.log('Picklist values fetched successfully: ', this.statusOptions);
        }
        else if(error){
            this.error = error;
            console.error('Error fetching picklist values: ', error);
    }
    }

    @wire(getRecord, { recordId: '$recordId', fields: [STATUS_FIELD] })caseRecord({data,error}){
     
      console.log('Fetching case record with ID: ', this.recordId);
      console.log('Record data: ', data);
        if(data){
            this.currentCaseStatus = data.fields.Status.value;
            console.log('Current case status: ', this.currentCaseStatus);
        }
        else if(error){
            this.error = error;
            console.error('Error fetching case record: ', error);
        }
    }
  //   handleChannelName(event) {
  //   this.channelName = event.target.value;
  // }

  // Initializes the component
  connectedCallback() {
   this.handleSubscribe();
   this.registerErrorListener();
  }

  // Handles subscribe button click
  handleSubscribe() {
    // Callback invoked whenever a new event message is received
    const messageCallback = (response)=>{
      console.log("New message received: ", JSON.stringify(response));
      // Response contains the payload of the new message received
this.handlePlatFormEvent(response);
    };

  subscribe(this.channelName, -1, messageCallback).then((response) => {
      // Response contains the subscription information on subscribe call
      console.log("Subscription request sent to: ", JSON.stringify(response.channel));
      this.subscription = response;
      this.isSubscribeDisabled = true;
      this.isUnsubscribeDisabled = false;
    });
  }
handleUnsubscribe() {
  unsubscribe(this.subscription, response => {
    console.log("Unsubscribed from channel: ", JSON.stringify(response.channel));
    this.subscription = {};
    this.isSubscribeDisabled = false;
    this.isUnsubscribeDisabled = true;
  });
}
registerErrorListener() {
    // Invoke onError empApi method
    onError((error) => {
      console.log("Received error from server: ", JSON.stringify(error));
      // Error contains the server-side error
    });
  }
  disconnectedCallback() {
    // Unsubscribe from the channel when the component is removed from the DOM
    // if (this.subscription && this.subscription.channel) {
    //   unsubscribe(this.subscription, response => {
    //     console.log("Unsubscribed from channel: ", JSON.stringify(response.channel));
    //   });
    // }
    this.handleUnsubscribe();
  }
  async handlePlatFormEvent(response) {
    console.log('Platform event received: ', JSON.stringify(response));
    // Handle the platform event as needed
if(response.hasOwnProperty('data') && response.data.hasOwnProperty('payload')&& response.data.payload.hasOwnProperty('Case_Status__c') &&response.data.payload.hasOwnProperty('Case_ID__c') ){
  const payLoad=response.data.payload;
  const caseId=payLoad.Case_ID__c;
  const caseStatus=payLoad.Case_Status__c;
  const fields = {};
  fields[CASE_ID_FIELD.fieldApiName]=caseId;
  fields[STATUS_FIELD.fieldApiName]=caseStatus;
  try{
  await updateRecord({fields});
  console.log('Case record updated successfully with new status: ', caseStatus);
  await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
  this.customToastMessage('Success', `Case status updated to ${caseStatus}`, 'success');
}
catch(error){
  console.error('Error updating case record: ', error);
  }
}
  }
  customToastMessage(title, message, variant) {
    const event = new ShowToastEvent({
      title: title, 
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);  
  }
}

