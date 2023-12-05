import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './tabs';
import './prevalence-over-time-chart';
import './prevalence-over-time-table';
import { type NamedLapisFilter, TemporalGranularity } from '../types';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';
import { queryPrevalenceOverTime } from '../query/queryPrevalenceOverTime';

type View = 'bar' | 'line' | 'table';

export type PrevalenceOverTimeProps = {
    numerator: NamedLapisFilter | NamedLapisFilter[];
    denominator: NamedLapisFilter;
    granularity: TemporalGranularity;
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
    numerator: NamedLapisFilter | NamedLapisFilter[] = { displayName: '' };

    @property({ type: Object })
    denominator: NamedLapisFilter = { displayName: '' };

    @property({ type: String })
    granularity: TemporalGranularity = 'day';

    @property({ type: Number })
    smoothingWindow: number = 0;

    @property({ type: Object })
    views: View[] = ['bar', 'line', 'table'];

    private fetchingTask = new Task(this, {
        task: async ([lapis, numerator, denominator, granularity, smoothingWindow], { signal }) => {
            return queryPrevalenceOverTime(numerator, denominator, granularity, smoothingWindow, lapis, signal);
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
                                          .data=${data}
                                          type="bar"
                                      ></gs-prevalence-over-time-chart>
                                  </gs-tab>`
                                : ''}
                            ${view === 'line'
                                ? html`<gs-tab title="Line chart" .active="${index === 0}">
                                      <gs-prevalence-over-time-chart
                                          .data=${data}
                                          type="line"
                                      ></gs-prevalence-over-time-chart>
                                  </gs-tab>`
                                : ''}
                            ${view === 'table'
                                ? html`<gs-tab title="Table" .active="${index === 0}">
                                      <gs-prevalence-over-time-table
                                          .data=${data}
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
