import { customElement, property } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';
import './component-toolbar-button';

@customElement('gs-component-toolbar')
export class ComponentToolbar extends LitElement {
    static override styles = css`
        :host {
            display: none;
        }
        :host([active]) {
            padding: 2px 2px 2px 0;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            gap: 4px;
        }
    `;

    @property({ type: Boolean, reflect: true })
    active = false;

    override render() {
        return html`
            <slot></slot>
            <gs-component-toolbar-button
                @click="${() =>
                    this.dispatchEvent(
                        new CustomEvent('toolbarclick', { detail: 'info', bubbles: true, composed: true }),
                    )}"
                >&#9432;</gs-component-toolbar-button
            >
        `;
    }
}
