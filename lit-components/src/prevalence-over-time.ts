import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { getGlobalDataManager } from './query/data';
import { FetchAggregatedQuery } from './query/FetchAggregatedQuery';
import { MapQuery } from './query/MapQuery';
import './tabs';
import './prevalence-over-time-chart';
import './prevalence-over-time-table';
import { GroupByAndSumQuery } from './query/GroupByAndSumQuery';
import { type LapisFilter, TimeGranularity } from './types';
import { SortQuery } from './query/SortQuery';
import { DivisionQuery } from './query/DivisionQuery';

@customElement('prevalence-over-time')
export class PrevalenceOverTime extends LitElement {
    static override styles = css`
        :host {
            display: block;
            border: solid 3px gray;
            padding: 16px;
            max-width: 800px;
        }
    `;

    @property({ type: Object })
    numerator: LapisFilter = {};

    @property({ type: Object })
    denominator: LapisFilter = {};

    @property({ type: String })
    granularity: TimeGranularity = 'day';

    private fetchingTask = new Task(this, {
        task: async ([numerator, denominator, granularity], { signal }) => {
            const fetchNumeratorQuery = new FetchAggregatedQuery<{
                date: string | null;
            }>(numerator, ['date']);
            const fetchDenominatorQuery = new FetchAggregatedQuery<{
                date: string | null;
            }>(denominator, ['date']);
            const mapNumeratorQuery = new MapQuery(fetchNumeratorQuery, (d) =>
                mapDateToGranularityRange(d, granularity),
            );
            const mapDenominatorQuery = new MapQuery(fetchDenominatorQuery, (d) =>
                mapDateToGranularityRange(d, granularity),
            );
            const groupByNumeratorQuery = new GroupByAndSumQuery(mapNumeratorQuery, 'dateRange', 'count');
            const groupByDenominatorQuery = new GroupByAndSumQuery(mapDenominatorQuery, 'dateRange', 'count');
            const sortedNumeratorQuery = new SortQuery(groupByNumeratorQuery, dateRangeCompare);
            const sortedDenominatorQuery = new SortQuery(groupByDenominatorQuery, dateRangeCompare);
            const divisionQuery = new DivisionQuery(sortedNumeratorQuery, sortedDenominatorQuery, 'dateRange', 'count');

            return getGlobalDataManager().evaluateQuery(divisionQuery, signal);
        },
        args: () => [this.numerator, this.denominator, this.granularity] as const,
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <h1>Prevalence over time</h1>
                Loading...
            `,
            complete: (data) => html`
                <h1>Prevalence over time</h1>

                <gs-tabs>
                    <gs-tab title="Chart" active="true">
                        <prevalence-over-time-chart .data=${data.content}></prevalence-over-time-chart>
                    </gs-tab>
                    <gs-tab title="Table">
                        <prevalence-over-time-table .data=${data.content}></prevalence-over-time-table>
                    </gs-tab>
                </gs-tabs>
            `,
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'prevalence-over-time': PrevalenceOverTime;
    }
}

function mapDateToGranularityRange(d: { date: string | null; count: number }, granularity: TimeGranularity) {
    let dateRange: string | null = null;
    if (d.date !== null) {
        switch (granularity) {
            case 'day':
                dateRange = d.date;
                break;
            case 'month':
                dateRange = `${new Date(d.date).getFullYear()}-${(new Date(d.date).getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}`;
                break;
            case 'year':
                dateRange = new Date(d.date).getFullYear().toString();
                break;
        }
    }
    return {
        dateRange,
        count: d.count,
    };
}

function dateRangeCompare(a: { dateRange: string | null }, b: { dateRange: string | null }) {
    if (a.dateRange === null) {
        return 1;
    }
    if (b.dateRange === null) {
        return -1;
    }
    return a.dateRange.localeCompare(b.dateRange);
}
