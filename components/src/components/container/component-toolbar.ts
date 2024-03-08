import { customElement, property } from 'lit/decorators.js';
import { html, TemplateResult } from 'lit';
import { TailwindElement } from '../../tailwind-element';

@customElement('gs-component-toolbar')
export class ComponentToolbar extends TailwindElement() {
    @property({ type: Array })
    bottomElements: TemplateResult[] = [];

    @property({ type: Array })
    topElements: TemplateResult[] = [];

    override render() {
        return html`
            <div class="mb-2 flex justify-end">${this.topElements}</div>
            <slot></slot>
            <div class="mt-2 flex justify-end">${this.bottomElements}</div>
        `;
    }
}
