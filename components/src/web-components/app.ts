import { provide } from '@lit/context';
import { Task } from '@lit/task';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import z from 'zod';

import { lapisContext } from './lapis-context';
import { referenceGenomeContext } from './reference-genome-context';
import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';
import { fetchReferenceGenome } from '../lapisApi/lapisApi';

const lapisUrlSchema = z.string().url();

/**
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
     * Required.
     *
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
            const lapisUrl = lapisUrlSchema.parse(this.lapis);

            this.referenceGenome = await fetchReferenceGenome(lapisUrl);
        },
        args: () => [this.lapis],
    });

    override render() {
        return this.updateReferenceGenome.render({
            complete: () => html``, // Children will be rendered in the light DOM anyway. We can't use slots without a shadow DOM.
            error: (error) => {
                if (error instanceof z.ZodError) {
                    return GsAppError(`Invalid LAPIS URL: '${this.lapis}'`);
                }

                return GsAppError('Cannot fetch reference genome. Is LAPIS available?');
            },
        });
    }

    override createRenderRoot() {
        return this;
    }
}

function GsAppError(error: string) {
    return html` <div class="m-2 w-full alert alert-error">Error: ${error}</div>`;
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-app': App;
    }
}

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-app': {
                lapis: string;
                // eslint-disable-next-line no-undef
                children: React.ReactNode;
            };
        }
    }
}
