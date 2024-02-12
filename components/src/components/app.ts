import { html, LitElement } from 'lit';
import { provide } from '@lit/context';
import { lapisContext } from '../lapis-context';
import { property, customElement } from 'lit/decorators.js';

@customElement('gs-app')
class App extends LitElement {
    @provide({ context: lapisContext })
    @property()
    lapis: string = '';

    override render() {
        return html`<slot />`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-app': App;
    }
}
