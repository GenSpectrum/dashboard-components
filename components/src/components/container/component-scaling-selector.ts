import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../../tailwind-element';

export type ScaleType = 'linear' | 'logarithmic' | 'logit';

export function getYAxisScale(scaleType: ScaleType) {
    switch (scaleType) {
        case 'linear': {
            return { beginAtZero: true, type: 'linear' as const };
        }
        case 'logarithmic': {
            return { type: 'logarithmic' as const };
        }
        case 'logit':
            return { type: 'logit' as const };
        default:
            return { beginAtZero: true, type: 'linear' as const };
    }
}

@customElement('gs-component-scaling-selector')
export class ComponentScalingSelector extends TailwindElement() {
    @property({ attribute: false })
    setYAxisScaleType: (scaleType: ScaleType) => void = () => {};

    @property({ type: String })
    currentScaleType: ScaleType = 'linear';

    private scales = [
        { label: 'Linear', value: 'linear' },
        { label: 'Logarithmic', value: 'logarithmic' },
        { label: 'Logit', value: 'logit' },
    ];

    private onChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        const value = select.value as ScaleType;
        this.setYAxisScaleType(value);
    }

    override render() {
        const scaleOptions = this.scales.map((scale) => {
            return html` <option value="${scale.value}" ?selected=${this.currentScaleType === scale.value}>
                ${scale.label}
            </option>`;
        });

        return html`
            <select class="select select-xs select-bordered" @change="${this.onChange}">
                <option disabled selected>Pick your y axis scaling</option>
                ${scaleOptions}
            </select>
        `;
    }
}
