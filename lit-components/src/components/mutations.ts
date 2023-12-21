import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './component-container';
import './mutations-table';
import { type LapisFilter, SequenceType } from '../types';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';
import { queryMutations } from '../query/queryMutations';

type View = 'table';

export type MutationsProps = {
    variant: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
};

@customElement('gs-mutations')
export class Mutations extends LitElement {
    static override styles = css`
        .content {
            max-height: 300px;
            overflow-y: auto;
        }
    `;

    @consume({ context: lapisContext })
    lapis: string = '';

    @property({ type: Object })
    variant: LapisFilter = { displayName: '' };

    @property({ type: String })
    sequenceType: SequenceType = 'nucleotide';

    @property({ type: Object })
    views: View[] = ['table'];

    private fetchingTask = new Task(this, {
        task: async ([lapis, variant, sequenceType], { signal }) => {
            return queryMutations(variant, sequenceType, lapis, signal);
        },
        args: () => [this.lapis, this.variant, this.sequenceType, this.views] as const,
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <h1>Prevalence over time</h1>
                Loading...
            `,
            complete: (data) => html`
                <h1>Prevalence over time</h1>

                <gs-component-container>
                    ${this.views.map(
                        (view, index) => html`
                            ${view === 'table'
                                ? html`<gs-component-tab slot="content" title="Table" .active="${index === 0}">
                                          <div class="content">
                                              <gs-mutations-table .data=${data}></gs-mutations-table>
                                          </div>
                                      </gs-component-tab>
                                      <gs-component-toolbar slot="toolbar" .active="${index === 0}">
                                      </gs-component-toolbar>
                                      <gs-component-info slot="info"> TODO </gs-component-info> `
                                : ''}
                        `,
                    )}
                </gs-component-container>
            `,
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations': Mutations;
    }
}
