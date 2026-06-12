import { LightningElement, track } from 'lwc';

export default class Controls extends LightningElement {
    @track factor = 2;

    handleFactorChange(event) {
        this.factor = Number(event.target.value);
    }

    handleAdd() {
        this.dispatchEvent(new CustomEvent('add'));
    }

    handleSubtract() {
        this.dispatchEvent(new CustomEvent('subtract'));
    }

    handleMultiply() {
        this.dispatchEvent(new CustomEvent('multiply', { detail: this.factor }));
    }
}
