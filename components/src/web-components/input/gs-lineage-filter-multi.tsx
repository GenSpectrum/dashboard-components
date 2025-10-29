import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { LineageMultiFilterChangedEvent } from '../../preact/lineageFilter/lineage-filter-multi';
import { MultiLineageFilter, type MultiLineageFilterProps } from '../../preact/lineageFilter/lineage-filter-multi';
import { type gsEventNames } from '../../utils/gsEventNames';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 *
 * ## Context
 *
 * This component provides a multi-select input field to filter by multiple lineages.
 * Currently, it is designed to work well with Pango Lineages,
 * but it may also be used for other lineage types, if suitable.
 *
 * It fetches all available values of the `lapisField` from the LAPIS instance within the given `lapisFilter`
 * and provides an autocomplete list with the available values of the lineage and sublineage queries
 * (a `*` appended to the lineage value).
 *
 * Selected lineages are displayed as removable chips above the input field.
 *
 * @fires {CustomEvent<Record<string, string[] | undefined>>} gs-lineage-filter-changed
 * Fired when the selection changes.
 * The `details` of this event contain an object with the `lapisField` as key and an array of selected lineages as value.
 * Example:
 * ```
 * {
 *  "pangoLineage": ["B.1.1.7", "BA.5"]
 * }
 *  ```
 */
@customElement('gs-lineage-filter-multi')
export class MultiLineageFilterComponent extends PreactLitAdapter {
    /**
     * The initial value to use for this lineage filter.
     * Can be provided as an array of strings or a comma-separated string.
     * Examples: ["B.1.1.7", "BA.5"] or "B.1.1.7,BA.5"
     */
    @property({ type: Array })
    value: string | string[] = [];

    /**
     * Required.
     *
     * The LAPIS field name to use for this lineage filter.
     * The field must exist on this LAPIS instance.
     */
    @property()
    lapisField = '';

    /**
     * The filter that is used to fetch the available the autocomplete options.
     * If not set it fetches all available options.
     * It must be a valid LAPIS filter object.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | string[] | number | null | boolean | undefined> & {
        nucleotideMutations?: string[];
        aminoAcidMutations?: string[];
        nucleotideInsertions?: string[];
        aminoAcidInsertions?: string[];
    } = {};

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

    /**
     * Whether to hide counts behind lineage options in the drop down selection and selected chips.
     * Defaults to false.
     */
    @property({ type: Boolean })
    hideCounts: boolean | undefined = false;

    override render() {
        return (
            <MultiLineageFilter
                lapisField={this.lapisField}
                lapisFilter={this.lapisFilter}
                placeholderText={this.placeholderText}
                value={this.value}
                width={this.width}
                hideCounts={this.hideCounts}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-lineage-filter-multi': MultiLineageFilterComponent;
    }

    interface HTMLElementEventMap {
        [gsEventNames.lineageFilterChanged]: LineageMultiFilterChangedEvent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-lineage-filter-multi': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
type InitialValueMatches = Expect<Equals<typeof MultiLineageFilterComponent.prototype.value, MultiLineageFilterProps['value']>>;
type LapisFieldMatches = Expect<
    Equals<typeof MultiLineageFilterComponent.prototype.lapisField, MultiLineageFilterProps['lapisField']>
>;
type LapisFilterMatches = Expect<
    Equals<typeof MultiLineageFilterComponent.prototype.lapisFilter, MultiLineageFilterProps['lapisFilter']>
>;
type PlaceholderTextMatches = Expect<
    Equals<typeof MultiLineageFilterComponent.prototype.placeholderText, MultiLineageFilterProps['placeholderText']>
>;
type WidthMatches = Expect<Equals<typeof MultiLineageFilterComponent.prototype.width, MultiLineageFilterProps['width']>>;
/* eslint-enable @typescript-eslint/no-unused-vars */
