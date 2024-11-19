import { customElement, property } from 'lit/decorators.js';
import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

import { ReferenceGenomesAwaiter } from '../../preact/components/ReferenceGenomesAwaiter';
import {
    MutationFilter,
    type MutationFilterProps,
    type SelectedMutationFilterStrings,
} from '../../preact/mutationFilter/mutation-filter';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * ## Context
 * This component provides an input field to specify filters for nucleotide and amino acid mutations and insertions.
 *
 * Input values have to be provided one at a time and submitted by pressing the Enter key or by selecting an option from the dropdown.
 * Alternatively, they can be provided as a string of comma-separated values, which will be directly parsed and validated.
 * After submission (after pressing Enter or pasting a comma-separated string) an event is fired with the selected mutations.
 * All previously selected mutations are displayed at the input field and added to the event.
 * Users can remove a mutation by clicking the 'x' button next to the mutation.
 *
 * ## Input Validation
 *
 * Validation of the input is performed according to the following rules:
 *
 * ### Mutations
 *
 * Mutations have to conform to the following format: `<gene/segment>:<symbol at reference><position><Substituted symbol/Deletion>`
 * - Gene/segment: The gene or segment where the mutation occurs. Must be contained in the reference genome.
 *   (Optional for elements with only one gene/segment)
 * - Symbol at reference: The symbol at the reference position. (Optional)
 * - Position: The position of the mutation. (Required)
 * - Substituted symbol/Deletion: The substituted symbol or '-' for a deletion. (Required)
 *
 * Examples: `S:614G`, `614G`, `614-`, `614G`
 *
 * ### Insertions
 *
 * Insertions have to conform to the following format: `ins_<gene/segment>:<position>:<Inserted symbols>`
 * - Gene/segment: The gene or segment where the insertion occurs. Must be contained in the reference genome.
 *   (Optional for elements with only one gene/segment)
 * - Position: The position of the insertion. (Required)
 * - Inserted symbols: The symbols that are inserted. (Required)
 *
 * Examples: `ins_S:614:G`, `ins_614:G`
 *
 * @fires {CustomEvent<{
 *      nucleotideMutations: string[],
 *      aminoAcidMutations: string[],
 *      nucleotideInsertions: string[],
 *      aminoAcidInsertions: string[]
 *  }>} gs-mutation-filter-changed
 * Fired when:
 * - The user has submitted a valid mutation or insertion
 * - The user has removed a mutation or insertion
 */
@customElement('gs-mutation-filter')
export class MutationFilterComponent extends PreactLitAdapter {
    // prettier-ignore
    // The multiline union type must not start with `|` because it looks weird in the Storybook docs
    /**
     * The initial value to use for this mutation filter.
     * All values provided must be valid mutations or insertions.
     * Invalid values will be ignored.
     */
    @property({ type: Object })
    initialValue:
        {
            nucleotideMutations: string[];
            aminoAcidMutations: string[];
            nucleotideInsertions: string[];
            aminoAcidInsertions: string[];
        }
        | string[]
        | undefined = undefined;

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return (
            <ReferenceGenomesAwaiter>
                <MutationFilter initialValue={this.initialValue} width={this.width} />
            </ReferenceGenomesAwaiter>
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutation-filter': MutationFilterComponent;
    }

    interface HTMLElementEventMap {
        'gs-mutation-filter-changed': CustomEvent<SelectedMutationFilterStrings>;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-mutation-filter': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type InitialValueMatches = Expect<
    Equals<typeof MutationFilterComponent.prototype.initialValue, MutationFilterProps['initialValue']>
>;
type WidthMatches = Expect<Equals<typeof MutationFilterComponent.prototype.width, MutationFilterProps['width']>>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
