import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import '../container/component-headline';
import '../container/component-tabs';
import '../container/component-toolbar';
import '../container/component-info';
import './prevalence-over-time-line-bar-chart';
import './prevalence-over-time-bubble-chart';
import './prevalence-over-time-table';
import '../container/component-scaling-selector';
import { type NamedLapisFilter, TemporalGranularity } from '../../types';
import { lapisContext } from '../../lapis-context';
import { consume } from '@lit/context';
import { PrevalenceOverTimeData, queryPrevalenceOverTime } from '../../query/queryPrevalenceOverTime';
import { ScaleType } from '../container/component-scaling-selector';
import { getPrevalenceOverTimeTableData } from './getPrevalenceOverTimeTableData';

type View = 'bar' | 'line' | 'bubble' | 'table';
type GraphView = 'bar' | 'line' | 'bubble';

export type PrevalenceOverTimeProps = {
    numerator: NamedLapisFilter | NamedLapisFilter[];
    denominator: NamedLapisFilter;
    granularity: TemporalGranularity;
    smoothingWindow: number;
    views: View[];
};

@customElement('gs-prevalence-over-time')
export class PrevalenceOverTime extends LitElement {
    @consume({ context: lapisContext })
    lapis: string = '';

    @property({ type: Object })
    numerator: NamedLapisFilter | NamedLapisFilter[] = { displayName: '' };

    @property({ type: Object })
    denominator: NamedLapisFilter = { displayName: '' };

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    @property({ type: Number })
    smoothingWindow: number = 0;

    @property({ type: Array })
    views: View[] = ['bar', 'line', 'bubble', 'table'];

    yAxisScaleType: Record<GraphView, ScaleType> = {
        bar: 'linear',
        line: 'linear',
        bubble: 'linear',
    };

    private setYAxisScaleType = (scaleType: ScaleType, view: GraphView) => {
        this.yAxisScaleType[view] = scaleType;
        this.requestUpdate();
    };

    private fetchingTask = new Task(this, {
        task: async ([lapis, numerator, denominator, granularity, smoothingWindow], { signal }) => {
            return queryPrevalenceOverTime(numerator, denominator, granularity, smoothingWindow, lapis, signal);
        },
        args: () =>
            [this.lapis, this.numerator, this.denominator, this.granularity, this.smoothingWindow, this.views] as const,
    });

    getScalingSelector(view: GraphView) {
        return html`
            <gs-component-scaling-selector
                .setYAxisScaleType=${(scaleType: ScaleType) => {
                    this.setYAxisScaleType(scaleType, view);
                }}
                currentScaleType=${this.yAxisScaleType[view]}
            >
            </gs-component-scaling-selector>
        `;
    }

    getBarChartView(data: PrevalenceOverTimeData) {
        const info = html` <gs-component-info content="Bar chart"></gs-component-info>`;

        return html`
            <gs-component-toolbar .topElements=${[this.getScalingSelector('bar'), info]}>
                <gs-prevalence-over-time-line-bar-chart
                    .data=${data}
                    type="bar"
                    yAxisScaleType=${this.yAxisScaleType['bar']}
                ></gs-prevalence-over-time-line-bar-chart>
            </gs-component-toolbar>
        `;
    }

    getLineChartView(data: PrevalenceOverTimeData) {
        const info = html` <gs-component-info content="Line chart"></gs-component-info>`;

        return html`
            <gs-component-toolbar .topElements=${[this.getScalingSelector('line'), info]}>
                <gs-prevalence-over-time-line-bar-chart
                    .data=${data}
                    type="line"
                    yAxisScaleType=${this.yAxisScaleType['line']}
                ></gs-prevalence-over-time-line-bar-chart>
            </gs-component-toolbar>
        `;
    }

    getBubbleChartView(data: PrevalenceOverTimeData) {
        const info = html` <gs-component-info content="Bubble chart"></gs-component-info>`;

        return html`
            <gs-component-toolbar .topElements=${[this.getScalingSelector('bubble'), info]}>
                <gs-prevalence-over-time-bubble-chart
                    .data=${data}
                    yAxisScaleType=${this.yAxisScaleType['bubble']}
                ></gs-prevalence-over-time-bubble-chart>
            </gs-component-toolbar>
        `;
    }

    getViewContent(view: View, data: PrevalenceOverTimeData) {
        switch (view) {
            case 'bar':
                return this.getBarChartView(data);
            case 'line':
                return this.getLineChartView(data);
            case 'bubble':
                return this.getBubbleChartView(data);
            case 'table':
                return html` <gs-prevalence-over-time-table .data=${data}></gs-prevalence-over-time-table>`;
        }
    }

    getViewTitle(view: View) {
        switch (view) {
            case 'bar':
                return 'Bar';
            case 'line':
                return 'Line';
            case 'bubble':
                return 'Bubble';
            case 'table':
                return 'Table';
        }
    }

    heading: string = 'Prevalence over time';

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <gs-component-headline heading=${this.heading}><p>Loading...</p></gs-component-headline>
            `,
            complete: (data: PrevalenceOverTimeData) => {
                const tabs = this.views.map((view) => {
                    return {
                        title: this.getViewTitle(view),
                        content: this.getViewContent(view, data),
                    };
                });

                const toolbar = html` <gs-component-csv-download-button
                    class="m-1 btn btn-sm"
                    filename="prevalence-over-time.csv"
                    .getData=${() => getPrevalenceOverTimeTableData(data, this.granularity)}
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

    override createRenderRoot() {
        return this;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-prevalence-over-time': PrevalenceOverTime;
    }
}
