import { html, LitElement } from 'lit';
import { provide } from '@lit/context';
import { lapisContext } from './lapis-context';
import { property, customElement } from 'lit/decorators.js';

@customElement('genspectrum-app')
class GenspectrumApp extends LitElement {
    @provide({ context: lapisContext })
    @property()
    lapis: string = '';

    override render() {
        return html`<slot></slot>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'genspectrum-app': GenspectrumApp;
    }
}
