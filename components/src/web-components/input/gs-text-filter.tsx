import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { type TextFilterChangedEvent } from '../../preact/textFilter/TextFilterChangedEvent';
import { TextFilter, type TextFilterProps } from '../../preact/textFilter/text-filter';
import { type gsEventNames } from '../../utils/gsEventNames';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 *
 * ## Context
 *
 * This component provides a text input field to specify filters for arbitrary fields of this LAPIS instance.
 *
 * @fires {CustomEvent<Record<string, string | undefined>>} gs-text-filter-changed
 * Fired when the input field is changed.
 * The `details` of this event contain an object with the `lapisField` as key and the input value as value.
 * Example:
 * ```
 * {
 *  "host": "Homo sapiens"
 * }
 *  ```
 */
@customElement('gs-text-filter')
export class TextFilterComponent extends PreactLitAdapter {
    /**
     * The initial value to use for this text filter.
     */
    @property()
    value: string | undefined = undefined;

    /**
     * Required.
     *
     * The LAPIS field name to use for this text filter.
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
     * Whether to hide counts behind options in the drop down selection.
     * Defaults to false.
     */
    @property({ type: Boolean })
    hideCounts: boolean | undefined = false;

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return (
            <TextFilter
                lapisField={this.lapisField}
                lapisFilter={this.lapisFilter}
                placeholderText={this.placeholderText}
                hideCounts={this.hideCounts}
                value={this.value}
                width={this.width}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-text-filter': TextFilterComponent;
    }

    interface HTMLElementEventMap {
        [gsEventNames.textFilterChanged]: TextFilterChangedEvent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-text-filter': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
type InitialValueMatches = Expect<Equals<typeof TextFilterComponent.prototype.value, TextFilterProps['value']>>;
type LapisFieldMatches = Expect<Equals<typeof TextFilterComponent.prototype.lapisField, TextFilterProps['lapisField']>>;
type LapisFilterMatches = Expect<
    Equals<typeof TextFilterComponent.prototype.lapisFilter, TextFilterProps['lapisFilter']>
>;
type PlaceholderTextMatches = Expect<
    Equals<typeof TextFilterComponent.prototype.placeholderText, TextFilterProps['placeholderText']>
>;
type WidthMatches = Expect<Equals<typeof TextFilterComponent.prototype.width, TextFilterProps['width']>>;
/* eslint-enable @typescript-eslint/no-unused-vars */
