import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { FetchAggregatedQuery } from '../query/FetchAggregatedQuery';
import { MapQuery } from '../query/MapQuery';
import './tabs';
import './prevalence-over-time-chart';
import './prevalence-over-time-table';
import { GroupByAndSumQuery } from '../query/GroupByAndSumQuery';
import { type LapisFilter, TemporalGranularity } from '../types';
import { SortQuery } from '../query/SortQuery';
import { DivisionQuery } from '../query/DivisionQuery';
import { getMinMaxString } from '../utils';
import { FillMissingQuery } from '../query/FillMissingQuery';
import { generateAllInRange } from '../temporal-utils';
import { SlidingQuery } from '../query/SlidingQuery';
import { Query } from '../query/Query';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';

type View = 'bar' | 'line' | 'table';

export type PrevalenceOverTimeProps = {
    numerator: LapisFilter;
    denominator: LapisFilter;
    granularity: 'day' | 'week' | 'month';
    smoothingWindow: number;
    views: View[];
};

@customElement('gs-prevalence-over-time')
export class PrevalenceOverTime extends LitElement {
    static override styles = css`
        :host {
            display: block;
            border: solid 3px gray;
            padding: 16px;
            max-width: 800px;
        }
    `;

    @consume({ context: lapisContext })
    lapis: string = '';

    @property({ type: Object })
    numerator: LapisFilter = {};

    @property({ type: Object })
    denominator: LapisFilter = {};

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    @property({ type: Number })
    smoothingWindow: number = 0;

    @property({ type: Object })
    views: View[] = ['bar', 'line', 'table'];

    private fetchingTask = new Task(this, {
        task: async ([lapis, numerator, denominator, granularity, smoothingWindow], { signal }) => {
            const fetchNumerator = new FetchAggregatedQuery<{
                date: string | null;
            }>(numerator, ['date']);
            const fetchDenominator = new FetchAggregatedQuery<{
                date: string | null;
            }>(denominator, ['date']);
            const mapNumerator = new MapQuery(fetchNumerator, (d) => mapDateToGranularityRange(d, granularity));
            const mapDenominator = new MapQuery(fetchDenominator, (d) => mapDateToGranularityRange(d, granularity));
            const groupByNumerator = new GroupByAndSumQuery(mapNumerator, 'dateRange', 'count');
            const groupByDenominator = new GroupByAndSumQuery(mapDenominator, 'dateRange', 'count');
            const fillNumerator = new FillMissingQuery(
                groupByNumerator,
                'dateRange',
                getMinMaxString,
                (min, max) => generateAllInRange(min, max, granularity),
                (key) => ({ dateRange: key, count: 0 }),
            );
            const fillDenominator = new FillMissingQuery(
                groupByDenominator,
                'dateRange',
                getMinMaxString,
                (min, max) => generateAllInRange(min, max, granularity),
                (key) => ({ dateRange: key, count: 0 }),
            );
            const sortNumerator = new SortQuery(fillNumerator, dateRangeCompare);
            const sortDenominator = new SortQuery(fillDenominator, dateRangeCompare);
            let smoothNumerator: Query<{ dateRange: string | null; count: number }> = sortNumerator;
            let smoothDenominator: Query<{ dateRange: string | null; count: number }> = sortDenominator;
            if (smoothingWindow >= 1) {
                smoothNumerator = new SlidingQuery(sortNumerator, smoothingWindow, averageSmoothing);
                smoothDenominator = new SlidingQuery(sortDenominator, smoothingWindow, averageSmoothing);
            }
            const divide = new DivisionQuery(smoothNumerator, smoothDenominator, 'dateRange', 'count', 'prevalence');
            return divide.evaluate(lapis, signal);
        },
        args: () =>
            [this.lapis, this.numerator, this.denominator, this.granularity, this.smoothingWindow, this.views] as const,
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
                    ${this.views.map(
                        (view, index) => html`
                            ${view === 'bar'
                                ? html`<gs-tab title="Bar chart" .active="${index === 0}">
                                      <gs-prevalence-over-time-chart
                                          .data=${data.content}
                                          type="bar"
                                      ></gs-prevalence-over-time-chart>
                                  </gs-tab>`
                                : ''}
                            ${view === 'line'
                                ? html`<gs-tab title="Line chart" .active="${index === 0}">
                                      <gs-prevalence-over-time-chart
                                          .data=${data.content}
                                          type="line"
                                      ></gs-prevalence-over-time-chart>
                                  </gs-tab>`
                                : ''}
                            ${view === 'table'
                                ? html`<gs-tab title="Table" .active="${index === 0}">
                                      <gs-prevalence-over-time-table
                                          .data=${data.content}
                                          .granularity=${this.granularity}
                                      ></gs-prevalence-over-time-table>
                                  </gs-tab>`
                                : ''}
                        `,
                    )}
                </gs-tabs>
            `,
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-prevalence-over-time': PrevalenceOverTime;
    }
}

function mapDateToGranularityRange(d: { date: string | null; count: number }, granularity: TemporalGranularity) {
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

function averageSmoothing(slidingWindow: { dateRange: string | null; count: number }[]) {
    const average = slidingWindow.reduce((acc, curr) => acc + curr.count, 0) / slidingWindow.length;
    const centerIndex = Math.floor(slidingWindow.length / 2);
    return { dateRange: slidingWindow[centerIndex].dateRange, count: average };
}
