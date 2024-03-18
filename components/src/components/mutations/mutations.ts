import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import '../container/component-headline';
import '../container/component-tabs';
import '../container/component-toolbar';
import '../container/component-checkbox-selector';
import '../container/component-info';
import './mutations-table';
import './mutations-grid';
import { type LapisFilter, SequenceType } from '../../types';
import { lapisContext } from '../../lapis-context';
import { consume } from '@lit/context';
import { queryMutations } from '../../query/queryMutations';
import { Dataset } from '../../operator/Dataset';
import { MutationEntry } from '../../operator/FetchMutationsOperator';
import { CheckboxItem } from '../container/component-checkbox-selector';

type View = 'table' | 'grid';

export type MutationsProps = {
    variant: LapisFilter;
    sequenceType: SequenceType;
    views: View[];
};

type DisplayedSegment = {
    segment: string;
    checked: boolean;
};

@customElement('gs-mutations')
export class Mutations extends LitElement {
    @consume({ context: lapisContext })
    lapis: string = '';

    @property({ type: Object })
    variant: LapisFilter = { displayName: '' };

    @property({ type: String })
    sequenceType: SequenceType = 'nucleotide';

    @property({ type: Array })
    views: View[] = ['table', 'grid'];

    displayedSegments = {
        table: [] as DisplayedSegment[],
        grid: [] as DisplayedSegment[],
    };

    heading: string = 'Mutations';

    private fetchingTask = new Task(this, {
        task: async ([lapis, variant, sequenceType], { signal }) => {
            const dataset = await queryMutations(variant, sequenceType, lapis, signal);

            const mutationSegments = dataset.content
                .map((mutationEntry) => mutationEntry.mutation.segment)
                .filter((segment): segment is string => segment !== undefined);

            const segments = [...new Set(mutationSegments)];
            return [dataset, segments] as const;
        },
        args: () => [this.lapis, this.variant, this.sequenceType] as const,
    });

    getViewTitle(view: View) {
        switch (view) {
            case 'table':
                return 'Table';
            case 'grid':
                return 'Grid';
        }
    }

    getViewContent(view: View, data: Dataset<MutationEntry>) {
        switch (view) {
            case 'table':
                return this.getTableView(data);
            case 'grid':
                return this.getGridView(data);
        }
    }

    getTableView(data: Dataset<MutationEntry>) {
        const info = html` <gs-component-info content="Table"></gs-component-info>`;

        const segmentSelector = this.getSegmentSelector('table');

        return html` <gs-component-toolbar .topElements=${[segmentSelector, info]}>
            <gs-mutations-table .data=${data}></gs-mutations-table>
        </gs-component-toolbar>`;
    }

    getGridView(data: Dataset<MutationEntry>) {
        const info = html` <gs-component-info content="Grid"></gs-component-info>`;

        const segmentSelector = this.getSegmentSelector('grid');

        return html` <gs-component-toolbar .topElements=${[segmentSelector, info]}>
            <gs-mutations-grid .data=${data} .sequenceType=${this.sequenceType}></gs-mutations-grid>
        </gs-component-toolbar>`;
    }

    getSegmentSelector(view: View) {
        const segmentNames = this.displayedSegments[view].map((segment) => segment.segment);

        return this.displayedSegments[view].length > 1
            ? html` <gs-component-checkbox-selector
                  .items=${this.displayedSegments[view].map((segment) => {
                      return { label: segment.segment, checked: segment.checked };
                  })}
                  .label=${this.getSegmentSelectorLabel(segmentNames, 'Segments: ', view)}
                  .setItems=${(items: CheckboxItem[]) => {
                      this.displayedSegments[view] = items.map((item) => {
                          return { segment: item.label, checked: item.checked };
                      });
                      this.requestUpdate();
                  }}
              ></gs-component-checkbox-selector>`
            : html``;
    }

    updateDisplayedSegments(changedSegment: string, checked: boolean, view: View) {
        this.displayedSegments[view] = this.displayedSegments[view].map((displayedSegment) => {
            if (displayedSegment.segment === changedSegment) {
                return { ...displayedSegment, checked };
            }
            return displayedSegment;
        });
        this.requestUpdate();
    }

    getSegmentSelectorLabel(segments: string[], prefix: string, view: View) {
        const allSegmentsSelected = this.displayedSegments[view]
            .filter((segment) => segment.checked)
            .map((segment) => segment.segment);

        if (segments.length === allSegmentsSelected.length) {
            return prefix + 'all';
        }
        if (segments.length === 0) {
            return prefix + 'none';
        }
        return prefix + allSegmentsSelected.join(', ');
    }

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <gs-component-headline heading=${this.heading}><p>Loading...</p></gs-component-headline>
            `,
            complete: ([data, segments]) => {
                this.views.forEach((view) => {
                    if (this.displayedSegments[view].length === 0) {
                        this.displayedSegments[view] = segments.map((segment) => ({ segment, checked: true }));
                    }
                });

                const tabs = this.views.map((view) => {
                    const filteredData = data.content.filter((mutationEntry) => {
                        if (mutationEntry.mutation.segment === undefined) {
                            return true;
                        }
                        return this.displayedSegments[view].some(
                            (displayedSegment) =>
                                displayedSegment.segment === mutationEntry.mutation.segment && displayedSegment.checked,
                        );
                    });

                    return {
                        title: this.getViewTitle(view),
                        content: this.getViewContent(view, { content: filteredData }),
                    };
                });

                const toolbar = html` <gs-component-csv-download-button
                    class="m-1 btn btn-sm"
                    filename="mutations.csv"
                    .getData=${() => data.content}
                ></gs-component-csv-download-button>`;

                return html`
                    <gs-component-headline heading=${this.heading}>
                        <gs-component-tabs .tabs=${tabs} .toolbar=${toolbar}></gs-component-tabs>
                    </gs-component-headline>
                `;
            },
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }
}
