import { provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { lapisContext } from './lapis-context';

@customElement('gs-app')
export class App extends LitElement {
    @provide({ context: lapisContext })
    @property()
    lapis: string = '';

    override render() {
        const children = [];
        for (const childNode of this.childNodes) {
            children.push(html`${childNode}`);
        }
        return html`${children}`;
    }

    override createRenderRoot() {
        return this;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-app': App;
    }
}
