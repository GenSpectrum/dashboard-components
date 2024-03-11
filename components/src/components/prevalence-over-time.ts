import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './container/component-container';
import './container/component-tab';
import './container/component-toolbar';
import './container/component-toolbar-button';
import './container/component-info';
import './prevalence-over-time-line-bar-chart';
import './prevalence-over-time-bubble-chart';
import './prevalence-over-time-table';
import './container/component-scaling-selector';
import { type NamedLapisFilter, TemporalGranularity } from '../types';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';
import { PrevalenceOverTimeData, queryPrevalenceOverTime } from '../query/queryPrevalenceOverTime';
import { ScaleType } from './container/component-scaling-selector';

type View = 'bar' | 'line' | 'bubble' | 'table';

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

    yAxisScaleType: ScaleType[] = ['linear', 'linear', 'linear', 'linear'];

    private setYAxisScaleType = (scaleType: ScaleType, index: number) => {
        this.yAxisScaleType[index] = scaleType;
        this.requestUpdate();
    };

    private fetchingTask = new Task(this, {
        task: async ([lapis, numerator, denominator, granularity, smoothingWindow], { signal }) => {
            return queryPrevalenceOverTime(numerator, denominator, granularity, smoothingWindow, lapis, signal);
        },
        args: () =>
            [this.lapis, this.numerator, this.denominator, this.granularity, this.smoothingWindow, this.views] as const,
    });

    override updated() {
        if (this.views.length !== this.yAxisScaleType.length) {
            this.yAxisScaleType = this.views.map(() => 'linear' as const);
        }
    }

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <h1>Prevalence over time</h1>
                <p>Loading...</p>
            `,
            complete: (data: PrevalenceOverTimeData) => html`
                <h1>Prevalence over time</h1>

                <gs-component-container>
                    ${this.views.map(
                        (view, index) => html`
                            ${view === 'bar'
                                ? html`
                                      <gs-component-tab slot="content" title="Bar" .active="${index === 0}">
                                          <gs-prevalence-over-time-line-bar-chart
                                              .data=${data}
                                              type="bar"
                                              yAxisScaleType=${this.yAxisScaleType[index]}
                                          ></gs-prevalence-over-time-line-bar-chart>
                                      </gs-component-tab>
                                      <gs-component-toolbar slot="toolbar" .active="${index === 0}">
                                          <gs-component-scaling-selector
                                              .setYAxisScaleType=${(scaleType: ScaleType) => {
                                                  this.setYAxisScaleType(scaleType, index);
                                              }}
                                              currentScaleType=${this.yAxisScaleType[index]}
                                          >
                                          </gs-component-scaling-selector>
                                      </gs-component-toolbar>
                                      <gs-component-info
                                          slot=" info
                                        "
                                      >
                                          <p>
                                              Here, we can provide some info about the chart, the methods, the data,
                                              etc.
                                          </p>
                                      </gs-component-info>
                                  `
                                : ''}
                            ${view === 'line'
                                ? html`
                                      <gs-component-tab slot="content" title="Line" .active="${index === 0}">
                                          <gs-prevalence-over-time-line-bar-chart
                                              .data=${data}
                                              type="line"
                                              yAxisScaleType=${this.yAxisScaleType[index]}
                                          ></gs-prevalence-over-time-line-bar-chart>
                                      </gs-component-tab>
                                      <gs-component-toolbar slot="toolbar" .active="${index === 0}">
                                          <gs-component-scaling-selector
                                              .setYAxisScaleType=${(scaleType: ScaleType) => {
                                                  this.setYAxisScaleType(scaleType, index);
                                              }}
                                              currentScaleType=${this.yAxisScaleType[index]}
                                          >
                                          </gs-component-scaling-selector>
                                      </gs-component-toolbar>
                                      <gs-component-info slot="info">
                                          <p>test2</p>
                                      </gs-component-info>
                                  `
                                : ''}
                            ${view === 'bubble'
                                ? html`
                                      <gs-component-tab slot="content" title="Bubble" .active="${index === 0}">
                                          <gs-prevalence-over-time-bubble-chart
                                              .data=${data}
                                              .granularity=${this.granularity}
                                              yAxisScaleType=${this.yAxisScaleType[index]}
                                          ></gs-prevalence-over-time-bubble-chart>
                                      </gs-component-tab>
                                      <gs-component-toolbar slot="toolbar" .active="${index === 0}">
                                          <gs-component-scaling-selector
                                              .setYAxisScaleType=${(scaleType: ScaleType) => {
                                                  this.setYAxisScaleType(scaleType, index);
                                              }}
                                              currentScaleType=${this.yAxisScaleType[index]}
                                          >
                                          </gs-component-scaling-selector>
                                      </gs-component-toolbar>
                                      <gs-component-info slot="info">
                                          <p>test2</p>
                                      </gs-component-info>
                                  `
                                : ''}
                            ${view === 'table'
                                ? html`
                                      <gs-component-tab slot="content" title="Table" .active="${index === 0}">
                                          <gs-prevalence-over-time-table
                                              .data=${data}
                                              .granularity=${this.granularity}
                                          ></gs-prevalence-over-time-table>
                                      </gs-component-tab>
                                      <gs-component-toolbar slot="toolbar" .active="${index === 0}">
                                          test3
                                      </gs-component-toolbar>
                                      <gs-component-info slot="info">
                                          <p>test3</p>
                                      </gs-component-info>
                                  `
                                : ''}
                        `,
                    )}
                </gs-component-container>
            `,
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
