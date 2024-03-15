import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import '../container/component-headline';
import '../container/component-tabs';
import '../container/component-toolbar';
import '../container/component-info';
import '../container/component-select';
import './relative-growth-advantage-chart';
import { type LapisFilter } from '../../types';
import { lapisContext } from '../../lapis-context';
import { consume } from '@lit/context';
import { queryRelativeGrowthAdvantage, RelativeGrowthAdvantageData } from '../../query/queryRelativeGrowthAdvantage';
import { ScaleType } from '../charts/scales';

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

    yAxisScaleType: ScaleType = 'linear';

    private setYAxisScaleType = (scaleType: ScaleType) => {
        this.yAxisScaleType = scaleType;
        this.requestUpdate();
    };

    private getScalingSelector() {
        return html`
            <gs-select
                selectStyle="select-xs select-bordered"
                .items=${[
                    { label: 'Linear', value: 'linear' },
                    { label: 'Logarithmic', value: 'logarithmic' },
                    { label: 'Logit', value: 'logit' },
                ]}
                .selected=${this.yAxisScaleType}
                @selectChange=${(event: CustomEvent) => {
                    this.setYAxisScaleType(event.detail.value as ScaleType);
                }}
            >
            </gs-select>
        `;
    }

    private fetchingTask = new Task(this, {
        task: async ([lapis, numerator, denominator, generationTime], { signal }) => {
            return await queryRelativeGrowthAdvantage(numerator, denominator, generationTime, lapis, signal);
        },
        args: () => [this.lapis, this.numerator, this.denominator, this.generationTime, this.views] as const,
    });

    heading: string = 'Relative growth advantage';

    private getViewTitle(view: View) {
        switch (view) {
            case 'line':
                return 'Line';
        }
    }

    private getLineChartView(data: NonNullable<RelativeGrowthAdvantageData>) {
        return html`
            <gs-relative-growth-advantage-chart
                .data=${{
                    ...data.estimatedProportions,
                    observed: data.observedProportions,
                }}
                yAxisScaleType=${this.yAxisScaleType}
            ></gs-relative-growth-advantage-chart>
            <div>
                Advantage: ${(data.params.fd.value * 100).toFixed(2)}% (${(data.params.fd.ciLower * 100).toFixed(2)}% -
                ${(data.params.fd.ciUpper * 100).toFixed(2)}%)
            </div>
        `;
    }

    private getViewContent(view: View, data: NonNullable<RelativeGrowthAdvantageData>) {
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
                        <gs-component-headline heading=${this.heading}> No data available.</gs-component-headline>
                    `;
                }

                const tabs = this.views.map((view) => {
                    return {
                        title: this.getViewTitle(view),
                        content: this.getViewContent(view, data),
                    };
                });

                const info = html` <gs-component-info content="Line chart"></gs-component-info>`;
                const scalingSelector = this.getScalingSelector();

                const toolbar = html` <div class="join">
                    <div class="join-item">${scalingSelector}</div>
                    <div class="join-item">${info}</div>
                </div>`;

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

declare global {
    interface HTMLElementTagNameMap {
        'gs-relative-growth-advantage': RelativeGrowthAdvantage;
    }
}
