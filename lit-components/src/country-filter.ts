import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * @fires country-changed - Indicates when the country changes
 */
@customElement('country-filter')
export class CountryFilter extends LitElement {
  @property()
  country = '';

  override render() {
    return html`
      <input type="text" .value="${this.country}" @input="${this.onInput}" />
      <button @click="${this.submitCountry}">Submit</button>
    `
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.country = input.value;
  }

  submitCountry() {
    this.dispatchEvent(new CustomEvent('country-changed', { detail: this.country }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'country-filter': CountryFilter;
  }
}

