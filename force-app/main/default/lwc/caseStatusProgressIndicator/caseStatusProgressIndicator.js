import { LightningElement ,api,wire} from 'lwc';
import {getObjectInfo,getPicklistValues} from 'lightning/uiObjectInfoApi';    
import {getRecord} from 'lightning/uiRecordApi';
import CASE_OBJECT from '@salesforce/schema/Case';
import STATUS_FIELD from '@salesforce/schema/Case.Status';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from "lightning/empApi";


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
    if (this.subscription && this.subscription.channel) {
      unsubscribe(this.subscription, response => {
        console.log("Unsubscribed from channel: ", JSON.stringify(response.channel));
      });
    }
  }
}