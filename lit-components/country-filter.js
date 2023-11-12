var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
/**
 * @fires country-changed - Indicates when the country changes
 */
let CountryFilter = class CountryFilter extends LitElement {
    constructor() {
        super(...arguments);
        this.country = '';
    }
    render() {
        return html `
      <input type="text" .value="${this.country}" @input="${this.onInput}" />
      <button @click="${this.submitCountry}">Submit</button>
    `;
    }
    onInput(event) {
        const input = event.target;
        this.country = input.value;
    }
    submitCountry() {
        this.dispatchEvent(new CustomEvent('country-changed', { detail: this.country }));
    }
};
__decorate([
    property()
], CountryFilter.prototype, "country", void 0);
CountryFilter = __decorate([
    customElement('country-filter')
], CountryFilter);
export { CountryFilter };
//# sourceMappingURL=country-filter.js.map