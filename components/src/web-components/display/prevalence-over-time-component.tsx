import { customElement, property } from 'lit/decorators.js';

import PrevalenceOverTime, { type View } from '../../preact/prevalenceOverTime/prevalence-over-time';
import { type ConfidenceIntervalMethod } from '../../preact/shared/charts/confideceInterval';
import { type NamedLapisFilter, type TemporalGranularity } from '../../types';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

@customElement('gs-prevalence-over-time')
export class PrevalenceOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
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

    @property({ type: Array })
    confidenceIntervalMethods: ConfidenceIntervalMethod[] = ['wilson'];

    /**
     * The size of the component.
     *
     * If not set, the component will take the full width of its container with height 700px.
     *
     * The width and height should be a string with a unit in css style, e.g. '100%', '500px' or '50vh'.
     * If the unit is %, the size will be relative to the container of the component.
     */
    @property({ type: Object })
    size: { width?: string; height?: string } | undefined = undefined;

    override render() {
        return (
            <PrevalenceOverTime
                numerator={this.numerator}
                denominator={this.denominator}
                granularity={this.granularity}
                smoothingWindow={this.smoothingWindow}
                views={this.views}
                confidenceIntervalMethods={this.confidenceIntervalMethods}
                size={this.size}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-prevalence-over-time': PrevalenceOverTimeComponent;
    }
}
