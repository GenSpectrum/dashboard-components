import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './tabs';
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
            complete: (data) => html`
                <h1>Relative growth advantage</h1>

                <gs-tabs
                    >${this.views.map(
                        (view, index) => html`
                            ${view === 'line'
                                ? html`<gs-tab title="Line chart" .active="${index === 0}">
                                      <gs-relative-growth-advantage-chart
                                          .data=${{ ...data.estimatedProportions, observed: data.observedProportions }}
                                          type="bar"
                                      ></gs-relative-growth-advantage-chart>
                                      <div>
                                          Advantage: ${(data.params.fd.value * 100).toFixed(2)}%
                                          (${(data.params.fd.ciLower * 100).toFixed(2)}% -
                                          ${(data.params.fd.ciUpper * 100).toFixed(2)}%)
                                      </div>
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
        'gs-relative-growth-advantage': RelativeGrowthAdvantage;
    }
}
