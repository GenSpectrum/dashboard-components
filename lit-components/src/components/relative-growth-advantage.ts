import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './container/component-container';
import './container/component-tab';
import './container/component-toolbar';
import './container/component-toolbar-button';
import './container/component-info';
import './relative-growth-advantage-chart';
import { type LapisFilter } from '../types';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';
import { queryRelativeGrowthAdvantage } from '../query/queryRelativeGrowthAdvantage';

type View = 'line';

export type RelativeGrowthAdvantageProps = {
    numerator: LapisFilter;
    denominator: LapisFilter;
    generationTime: number;
    views: View[];
};

@customElement('gs-relative-growth-advantage')
export class RelativeGrowthAdvantage extends LitElement {
    @consume({ context: lapisContext })
    lapis: string = '';

    @property({ type: Object })
    numerator: LapisFilter = {};

    @property({ type: Object })
    denominator: LapisFilter = {};

    @property({ type: Number })
    generationTime: number = 7;

    @property({ type: Object })
    views: View[] = ['line'];

    private fetchingTask = new Task(this, {
        task: async ([lapis, numerator, denominator, generationTime], { signal }) => {
            return await queryRelativeGrowthAdvantage(numerator, denominator, generationTime, lapis, signal);
        },
        args: () => [this.lapis, this.numerator, this.denominator, this.generationTime, this.views] as const,
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <h1>Relative growth advantage</h1>
                Loading...
            `,
            complete: (data) => {
                if (data === null) {
                    return html`
                        <h1>Relative growth advantage</h1>
                        <p>No data available.</p>
                    `;
                }
                return html`
                    <h1>Relative growth advantage</h1>

                    <gs-component-container>
                        >${this.views.map(
                            (view, index) => html`
                                ${view === 'line'
                                    ? html`<gs-component-tab slot="content" title="Line chart" .active="${index === 0}">
                                              <gs-relative-growth-advantage-chart
                                                  .data=${{
                                                      ...data.estimatedProportions,
                                                      observed: data.observedProportions,
                                                  }}
                                                  type="bar"
                                              ></gs-relative-growth-advantage-chart>
                                              <div>
                                                  Advantage: ${(data.params.fd.value * 100).toFixed(2)}%
                                                  (${(data.params.fd.ciLower * 100).toFixed(2)}% -
                                                  ${(data.params.fd.ciUpper * 100).toFixed(2)}%)
                                              </div>
                                          </gs-component-tab>
                                          <gs-component-toolbar slot="toolbar" .active="${index === 0}">
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
        'gs-relative-growth-advantage': RelativeGrowthAdvantage;
    }
}
