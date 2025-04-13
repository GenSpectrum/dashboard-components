import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { type NumberFilterChangedEvent } from '../../preact/numberFilter/NumberFilterChangedEvent';
import { NumberFilter } from '../../preact/numberFilter/number-filter';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 *
 * ## Context
 *
 * TODO
 */
@customElement('gs-number-filter')
export class NumberFilterComponent extends PreactLitAdapter {
    /**
     * The value to use for this number filter.
     */
    @property({ type: Object })
    value: { min?: number; max?: number } = {};

    /**
     * Required.
     *
     * The LAPIS field name to use for this text filter.
     * The field must exist on this LAPIS instance.
     */
    @property()
    lapisField = '';

    /**
     * The placeholder text to display in the input field.
     */
    @property()
    placeholderText: string | undefined = undefined;

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return (
            <NumberFilter
                lapisField={this.lapisField}
                placeholderText={this.placeholderText}
                value={this.value}
                width={this.width}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-number-filter': NumberFilterComponent;
    }

    interface HTMLElementEventMap {
        'gs-number-filter-changed': NumberFilterChangedEvent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-number-filter': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
