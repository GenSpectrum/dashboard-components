import { provide } from '@lit/context';
import { Task } from '@lit/task';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { lapisContext } from './lapis-context';
import { referenceGenomeContext } from './reference-genome-context';
import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';
import { fetchReferenceGenome } from '../lapisApi/lapisApi';

/**
 * ## Tag
 *
 * `gs-app`
 *
 * ## Context
 *
 * This component provides the main application context.
 * All other `gs-*` components must be (possibly nested) children of this component.
 * It makes use of the [Lit Context](https://lit.dev/docs/data/context/) to
 * - provide the URL to the LAPIS instance to all its children
 * - fetch the reference genomes from LAPIS and provide it to all its children
 *
 * This will show an error message if the reference genome cannot be fetched
 * (e.g., due to an invalid LAPIS URL).
 *
 * ## Shadow DOM
 *
 * This component does __not__ use a shadow DOM. Children of this component will be rendered directly in the light DOM.
 */
@customElement('gs-app')
export class App extends LitElement {
    /**
     * The URL of the LAPIS instance that all children of this component will use.
     */
    @provide({ context: lapisContext })
    @property()
    lapis: string = '';

    /**
     * @internal
     */
    @provide({ context: referenceGenomeContext })
    referenceGenome: ReferenceGenome = {
        nucleotideSequences: [],
        genes: [],
    };

    /**
     * @internal
     */
    private updateReferenceGenome = new Task(this, {
        task: async () => {
            this.referenceGenome = await fetchReferenceGenome(this.lapis);
        },
        args: () => [this.lapis],
    });

    override render() {
        return this.updateReferenceGenome.render({
            complete: () => html` <slot></slot>`,
            error: () => html`<p>Error</p>`, // TODO(#143): Add more advanced error handling
            pending: () => html` <p>Loading reference genomes...</p> `,
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
