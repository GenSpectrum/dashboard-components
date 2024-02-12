import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './container/component-container';
import './container/component-tab';
import './container/component-toolbar';
import './container/component-toolbar-button';
import './container/component-toolbar-button-checkboxes';
import './container/component-info';
import './mutations-table';
import './mutations-grid';
import { type LapisFilter, SequenceType } from '../types';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';
import { queryMutations } from '../query/queryMutations';
import { renderAllNoneOrCommaSeparated } from './container/component-toolbar-button-checkboxes';
import { segmentName } from '../mutations';

type View = 'table' | 'grid';

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

    @property({ type: Array })
    views: View[] = ['table', 'grid'];

    // TODO undefined means all segments, because I don't know how to properly initialize it with all segments.
    @property({ type: Array })
    selectedSegments: string[] | undefined = undefined;

    private fetchingTask = new Task(this, {
        task: async ([lapis, variant, sequenceType], { signal }) => {
            const dataset = await queryMutations(variant, sequenceType, lapis, signal);

            const mutationSegments = dataset.content
                .map((mutationEntry) => mutationEntry.mutation.segment)
                .filter((segment): segment is string => segment !== undefined);

            const segments = [...new Set(mutationSegments)];
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
                let filteredData = data;
                if (segments.length > 1 && this.selectedSegments !== undefined) {
                    filteredData = {
                        content: data.content.filter((d) => this.selectedSegments!.includes(d.mutation.segment!)),
                    };
                }

                const toolbar = (index: number) => html`
                    <gs-component-toolbar slot="toolbar" .active="${index === 0}">
                        ${segments.length > 1
                            ? html` <gs-component-toolbar-button-checkboxes
                                  .options=${segments}
                                  .renderButtonLabel=${renderAllNoneOrCommaSeparated(
                                      segments.length,
                                      segmentName[this.sequenceType] + ': ',
                                  )}
                                  .selected=${this.selectedSegments ?? segments}
                                  @change=${(e: CustomEvent<{ option: string; checked: boolean }>) => {
                                      const { option, checked } = e.detail;
                                      if (this.selectedSegments === undefined) {
                                          this.selectedSegments = segments.map((s) => s ?? '');
                                      }
                                      if (checked) {
                                          this.selectedSegments = [...this.selectedSegments, option];
                                      } else {
                                          this.selectedSegments = this.selectedSegments.filter((s) => s !== option);
                                      }
                                  }}
                              ></gs-component-toolbar-button-checkboxes>`
                            : ''}
                    </gs-component-toolbar>
                `;
                return html`
                    <h1>Mutations</h1>
                    <gs-component-container>
                        ${this.views.map(
                            (view, index) => html`
                                ${view === 'table'
                                    ? html`
                                          <gs-component-tab slot="content" title="Table" .active="${index === 0}">
                                              <div class="content">
                                                  <gs-mutations-table .data=${filteredData}></gs-mutations-table>
                                              </div>
                                          </gs-component-tab>
                                          ${toolbar(index)}
                                          <gs-component-info slot="info"> TODO</gs-component-info>
                                      `
                                    : ''}
                                ${view === 'grid'
                                    ? html`
                                          <gs-component-tab slot="content" title="Grid" .active="${index === 0}">
                                              <div class="content">
                                                  <gs-mutations-grid
                                                      .data=${filteredData}
                                                      .sequenceType=${this.sequenceType}
                                                  ></gs-mutations-grid>
                                              </div>
                                          </gs-component-tab>
                                          ${toolbar(index)}
                                          <gs-component-info slot="info"> TODO</gs-component-info>
                                      `
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
