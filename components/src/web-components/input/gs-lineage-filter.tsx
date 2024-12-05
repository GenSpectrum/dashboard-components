import { customElement, property } from 'lit/decorators.js';
import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

import { LineageFilter, type LineageFilterProps } from '../../preact/lineageFilter/lineage-filter';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 *
 * ## Context
 *
 * This component provides a text input field to filter by lineages.
 * Currently, it is designed to work well with Pango Lineages,
 * but it may also be used for other lineage types, if suitable.
 *
 * It fetches all available values of the `lapisField` from the LAPIS instance
 * and provides an autocomplete list with the available values of the lineage and sublineage queries
 * (a `*` appended to the lineage value).
 *
 * @fires {CustomEvent<Record<string, string>>} gs-lineage-filter-changed
 * Fired when the input field is changed.
 * The `details` of this event contain an object with the `lapisField` as key and the input value as value.
 * Example:
 * ```
 * {
 *  "pangoLineage": "B.1.1.7"
 * }
 *  ```
 */
@customElement('gs-lineage-filter')
export class LineageFilterComponent extends PreactLitAdapter {
    /**
     * The initial value to use for this lineage filter.
     */
    @property()
    initialValue: string = '';

    /**
     * Required.
     *
     * The LAPIS field name to use for this lineage filter.
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
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return (
            <LineageFilter
                lapisField={this.lapisField}
                placeholderText={this.placeholderText}
                initialValue={this.initialValue}
                width={this.width}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-lineage-filter': LineageFilterComponent;
    }

    interface HTMLElementEventMap {
        'gs-lineage-filter-changed': CustomEvent<Record<string, string>>;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-lineage-filter': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type InitialValueMatches = Expect<
    Equals<typeof LineageFilterComponent.prototype.initialValue, LineageFilterProps['initialValue']>
>;
type LapisFieldMatches = Expect<
    Equals<typeof LineageFilterComponent.prototype.lapisField, LineageFilterProps['lapisField']>
>;
type PlaceholderTextMatches = Expect<
    Equals<typeof LineageFilterComponent.prototype.placeholderText, LineageFilterProps['placeholderText']>
>;
type WidthMatches = Expect<Equals<typeof LineageFilterComponent.prototype.width, LineageFilterProps['width']>>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
