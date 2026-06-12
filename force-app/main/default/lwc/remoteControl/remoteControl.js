import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import COUNT_UPDATED_CHANNEL from '@salesforce/messageChannel/Count_Updated__c';

export default class RemoteControl extends LightningElement {
    @wire(MessageContext)
    messageContext;

    handleIncrement() {
        const payload = { operator: 'add', constant: 1 };
        publish(this.messageContext, COUNT_UPDATED_CHANNEL, payload);
    }

    handleDecrement() {
        const payload = { operator: 'subtract', constant: 1 };
        publish(this.messageContext, COUNT_UPDATED_CHANNEL, payload);
    }

    handleMultiply(event) {
        const factor = event.detail;
        const payload = { operator: 'multiply', constant: factor };
        publish(this.messageContext, COUNT_UPDATED_CHANNEL, payload);
    }
}
