import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import '../container/component-headline';
import '../container/component-tabs';
import '../container/component-toolbar';
import '../container/component-info';
import './relative-growth-advantage-chart';
import { type LapisFilter } from '../../types';
import { lapisContext } from '../../lapis-context';
import { consume } from '@lit/context';
import { queryRelativeGrowthAdvantage, RelativeGrowthAdvantageData } from '../../query/queryRelativeGrowthAdvantage';

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

    @property({ type: Array })
    views: View[] = ['line'];

    private fetchingTask = new Task(this, {
        task: async ([lapis, numerator, denominator, generationTime], { signal }) => {
            return await queryRelativeGrowthAdvantage(numerator, denominator, generationTime, lapis, signal);
        },
        args: () => [this.lapis, this.numerator, this.denominator, this.generationTime, this.views] as const,
    });

    heading: string = 'Relative growth advantage';

    getViewTitle(view: View) {
        switch (view) {
            case 'line':
                return 'Line';
        }
    }

    getLineChartView(data: NonNullable<RelativeGrowthAdvantageData>) {
        const info = html` <gs-component-info content="Line chart"></gs-component-info>`;

        return html`
            <gs-component-toolbar .bottomElements=${[info]}>
                <gs-relative-growth-advantage-chart
                    .data=${{
                        ...data.estimatedProportions,
                        observed: data.observedProportions,
                    }}
                ></gs-relative-growth-advantage-chart>
                <div>
                    Advantage: ${(data.params.fd.value * 100).toFixed(2)}%
                    (${(data.params.fd.ciLower * 100).toFixed(2)}% - ${(data.params.fd.ciUpper * 100).toFixed(2)}%)
                </div>
            </gs-component-toolbar>
        `;
    }

    getViewContent(view: View, data: NonNullable<RelativeGrowthAdvantageData>) {
        switch (view) {
            case 'line':
                return this.getLineChartView(data);
        }
    }

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <gs-component-headline heading=${this.heading}><p>Loading...</p></gs-component-headline>
            `,
            complete: (data) => {
                if (data === null) {
                    return html`
                        <gs-component-headline heading=${this.heading}> No data available. </gs-component-headline>
                    `;
                }

                const tabs = this.views.map((view) => {
                    return {
                        title: this.getViewTitle(view),
                        content: this.getViewContent(view, data),
                    };
                });

                return html`
                    <gs-component-headline heading=${this.heading}>
                        <gs-component-tabs .tabs=${tabs}></gs-component-tabs>
                    </gs-component-headline>
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
