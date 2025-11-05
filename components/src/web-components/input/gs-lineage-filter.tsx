import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import {
    type LineageFilterChangedEvent,
    type LineageMultiFilterChangedEvent,
} from '../../preact/lineageFilter/LineageFilterChangedEvent';
import { LineageFilter } from '../../preact/lineageFilter/lineage-filter';
import { type gsEventNames } from '../../utils/gsEventNames';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * ## Context
 *
 * This component provides a text input field to filter by lineages.
 * Currently, it is designed to work well with Pango Lineages,
 * but it may also be used for other lineage types, if suitable.
 *
 * It fetches all available values of the `lapisField` from the LAPIS instance within the given `lapisFilter`
 * and provides an autocomplete list with the available values of the lineage and sublineage queries
 * (a `*` appended to the lineage value).
 *
 * When `multiSelect` is true, it allows selecting multiple lineages and displays them as removable chips.
 *
 * @fires {CustomEvent<Record<string, string | undefined>>} gs-lineage-filter-changed
 * Fired when the selection changes in single-select mode.
 * The `details` of this event contain an object with the `lapisField` as key and the selected value as value.
 * Example:
 * ```
 * {
 *  "pangoLineage": "B.1.1.7"
 * }
 * ```
 *
 * @fires {CustomEvent<Record<string, string[] | undefined>>} gs-lineage-filter-multi-changed
 * Fired when the selection changes in multi-select mode.
 * The `details` of this event contain an object with the `lapisField` as key and an array of selected values.
 * Example:
 * ```
 * {
 *  "pangoLineage": ["B.1.1.7", "BA.5"]
 * }
 * ```
 */
@customElement('gs-lineage-filter')
export class LineageFilterComponent extends PreactLitAdapter {
    /**
     * The initial value to use for this lineage filter.
     * Can be a string for single select mode or an array of strings (or comma-separated string) for multi-select mode.
     * Examples: "B.1.1.7" or ["B.1.1.7", "BA.5"] or "B.1.1.7,BA.5"
     */
    @property({ type: Array })
    value: string | string[] = '';

    /**
     * Required.
     *
     * The LAPIS field name to use for this lineage filter.
     * The field must exist on this LAPIS instance.
     */
    @property()
    lapisField = '';

    /**
     * Whether to enable multi-select mode.
     * When true, allows selecting multiple lineages displayed as removable chips.
     * Defaults to false.
     */
    @property({ type: Boolean })
    multiSelect: boolean | undefined = false;

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
     * Whether to hide counts behind lineage options in the drop down selection.
     * Defaults to false.
     */
    @property({ type: Boolean })
    hideCounts: boolean | undefined = false;

    override render() {
        return (
            <LineageFilter
                lapisField={this.lapisField}
                lapisFilter={this.lapisFilter}
                placeholderText={this.placeholderText}
                value={this.value}
                width={this.width}
                hideCounts={this.hideCounts}
                multiSelect={this.multiSelect}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-lineage-filter': LineageFilterComponent;
    }

    interface HTMLElementEventMap {
        [gsEventNames.lineageFilterChanged]: LineageFilterChangedEvent;
        [gsEventNames.lineageFilterMultiChanged]: LineageMultiFilterChangedEvent;
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
