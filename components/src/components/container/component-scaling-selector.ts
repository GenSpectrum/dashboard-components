import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type scaleType = 'linear' | 'logarithmic' | 'logistic';

@customElement('gs-component-scaling-selector')
export class ComponentScalingSelector extends LitElement {
    @property({ attribute: false })
    setYAxisScaleType: (scaleType: scaleType) => void = () => {};

    @property({ type: String })
    currentScaleType: scaleType = 'linear';

    private scales = [
        { label: 'Linear', value: 'linear' },
        { label: 'Logarithmic', value: 'logarithmic' },
        { label: 'Logistic', value: 'logistic' },
    ];

    private onChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        const value = select.value as scaleType;
        this.setYAxisScaleType(value);
    }

    override render() {
        const scaleOptions = this.scales.map((scale) => {
            return html` <option value="${scale.value}" ?selected=${this.currentScaleType === scale.value}>
                ${scale.label}
            </option>`;
        });

        return html`
            <select class="select select-bordered" @change="${this.onChange}">
                <option disabled selected>Pick your y axis scaling</option>
                ${scaleOptions}
            </select>
        `;
    }
}
