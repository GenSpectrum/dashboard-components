import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './component-container';
import './mutations-table';
import { type LapisFilter, SequenceType } from '../types';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';
import { queryMutations } from '../query/queryMutations';
import { tooltip } from './tooltip';
import { segmentName } from '../mutations';

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
        .segments {
            display: flex;
            flex-direction: column;
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
            const dataset = await queryMutations(variant, sequenceType, lapis, signal);
            const segments = [...new Set(dataset.content.map((d) => d.mutation.segment))];
            return [dataset, segments] as const;
        },
        args: () => [this.lapis, this.variant, this.sequenceType, this.views] as const,
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <h1>Mutations</h1>
                Loading...
            `,
            complete: ([data, segments]) => {
                const segmentSelectionTooltip = html`
                    <div class="segments">
                        ${segments.map(
                            (segment) => html`
                                <label>
                                    <input type="checkbox" checked />
                                    ${segment}
                                </label>
                            `,
                        )}
                    </div>
                `;

                return html`
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
                                              ${segments.length > 1
                                                  ? html` <gs-component-toolbar-button
                                                        ${tooltip(segmentSelectionTooltip)}
                                                    >
                                                        ${segmentName[this.sequenceType]}: all
                                                    </gs-component-toolbar-button>`
                                                  : ''}
                                          </gs-component-toolbar>
                                          <gs-component-info slot="info"> TODO </gs-component-info> `
                                    : ''}
                            `,
                        )}
                    </gs-component-container>
                `;
            },
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations': Mutations;
    }
}
