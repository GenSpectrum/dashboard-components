import { customElement, property } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';

@customElement('gs-component-info')
export class ComponentInfo extends LitElement {
    static override styles = css`
        :host {
            display: none;
        }
        :host([active]) {
            display: block;
            padding: 5px;
        }
    `;

    @property({ type: Boolean, reflect: true })
    active = false;

    override render() {
        return html`<slot></slot>`;
    }
}
