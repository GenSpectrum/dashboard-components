import { customElement } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';

@customElement('gs-component-toolbar-button')
export class ComponentToolbarButton extends LitElement {
    static override styles = css`
        button {
            font-size: x-small;
            height: 20px;
        }
    `;

    override render() {
        return html`<button><slot></slot></button>`;
    }
}
