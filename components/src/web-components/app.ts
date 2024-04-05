import { provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { lapisContext } from './lapis-context';

@customElement('gs-app')
class App extends LitElement {
    @provide({ context: lapisContext })
    @property()
    lapis: string = '';

    override render() {
        return html`${this.childNodes}`;
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
