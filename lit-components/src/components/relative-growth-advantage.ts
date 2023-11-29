import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import './tabs';
import './relative-growth-advantage-chart';
import { type LapisFilter } from '../types';
import { lapisContext } from '../lapis-context';
import { consume } from '@lit/context';
import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { getMinMaxString } from '../utils';
import { getDaysInBetween } from '../temporal-utils';

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
            const fetchNumerator = new FetchAggregatedOperator<{
                date: string | null;
            }>(numerator, ['date']);
            const fetchDenominator = new FetchAggregatedOperator<{
                date: string | null;
            }>(denominator, ['date']);
            const [numeratorData, denominatorData] = await Promise.all([
                fetchNumerator.evaluate(lapis, signal),
                fetchDenominator.evaluate(lapis, signal),
            ]);
            const [minDate, maxDate] = getMinMaxString(denominatorData.content.map((d) => d.date));
            const numeratorCounts = new Map<string, number>();
            numeratorData.content.forEach((d) => {
                if (d.date) {
                    numeratorCounts.set(d.date, d.count);
                }
            });
            const requestData = {
                t: [] as number[],
                n: [] as number[],
                k: [] as number[],
            };
            denominatorData.content.forEach((d) => {
                if (d.date) {
                    const t = getDaysInBetween(minDate, d.date);
                    requestData.t.push(t);
                    requestData.n.push(d.count);
                    requestData.k.push(numeratorCounts.get(d.date) ?? 0);
                }
            });
            const requestPayload = {
                config: {
                    alpha: 0.95,
                    generationTime,
                    initialCasesVariant: 1,
                    initialCasesWildtype: 1,
                    reproductionNumberWildtype: 1,
                    tStart: 0,
                    tEnd: getDaysInBetween(minDate, maxDate),
                },
                data: requestData,
            };
            const response = await fetch('https://cov-spectrum.org/api/v2/computed/model/chen2021Fitness', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
                signal,
            });

            return response.json();
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
                                          .data=${data.estimatedProportions}
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
