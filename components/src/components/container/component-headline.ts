import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../../tailwind-element';

@customElement('gs-component-headline')
export class ComponentHeadline extends TailwindElement() {
    @property({ type: String })
    heading: string = '';

    override render() {
        return html`
            <div>
                <h1>${this.heading}</h1>
                <slot></slot>
            </div>
        `;
    }
}
