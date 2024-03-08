import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { TailwindElement } from '../../tailwind-element';

@customElement('gs-component-info')
export class ComponentInfo extends TailwindElement() {
    @property({ type: String })
    content: string = '';

    override render() {
        return html`<div class="tooltip" data-tip=${this.content}>
            <button class="btn btn-xs">?</button>
        </div>`;
    }
}
