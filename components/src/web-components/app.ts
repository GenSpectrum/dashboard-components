import { provide } from '@lit/context';
import { Task } from '@lit/task';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { lapisContext } from './lapis-context';
import { referenceGenomeContext } from './reference-genome-context';
import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';
import { fetchReferenceGenome } from '../lapisApi/lapisApi';

@customElement('gs-app')
export class App extends LitElement {
    @provide({ context: lapisContext })
    @property()
    lapis: string = '';

    @provide({ context: referenceGenomeContext })
    referenceGenome: ReferenceGenome = {
        nucleotideSequences: [],
        genes: [],
    };

    private updateReferenceGenome = new Task(this, {
        task: async () => {
            this.referenceGenome = await fetchReferenceGenome(this.lapis);
        },
        args: () => [this.lapis],
    });

    override render() {
        return this.updateReferenceGenome.render({
            complete: () => {
                return html` <slot></slot>`;
            },
            error: () => html`<p>Error</p>`, // TODO(#143): Add more advanced error handling
            pending: () => {
                return html`<p>Loading...</p>`;
            },
        });
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
