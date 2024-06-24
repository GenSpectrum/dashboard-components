import { customElement, property } from 'lit/decorators.js';

import { Mutations, type View } from '../../preact/mutations/mutations';
import { type LapisFilter, type SequenceType } from '../../types';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays mutations (substitutions, deletions and insertions) for a given variant.
 *
 * ## Views
 *
 * ### Table View
 *
 * The table view shows all substitutions and deletions for the given variant.
 * It shows the type (substitution or deletion), the total count of the mutation
 * and the proportion of the mutation in the variant.
 * The proportion is relative to the total number of sequences matching
 * the specified sequence filters with non-ambiguous reads at that position.
 *
 * The proportion interval filter can be used to filter the displayed mutations on client side.
 *
 * ### Grid View
 *
 * The grid view shows the proportion of each sequence symbol (nucleotide or amino acid) for each position that has a mutation.
 * Only positions with at least one mutation in the selected proportion interval are shown.
 *
 * ### Insertions View
 *
 * The insertions view shows the count of all insertions for the given variant.
 *
 */
@customElement('gs-mutations')
export class MutationsComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * Required.
     *
     * The `variant` will be sent as is to LAPIS to filter the mutation data.
     * It must be a valid LAPIS filter object.
     */
    @property({ type: Object })
    variant: Record<string, string | number | null | boolean> = {};

    /**
     * The type of the sequence for which the mutations should be shown.
     */
    @property({ type: String })
    sequenceType: 'nucleotide' | 'amino acid' = 'nucleotide';

    /**
     * A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: ('table' | 'grid' | 'insertions')[] = ['table', 'grid'];

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string = '700px';

    /**
     * The headline of the component. Set to an empty string to hide the headline.
     */
    @property({ type: String })
    headline: string = 'Mutations';

    /**
     * The maximum number of rows to display in the table view.
     * Set to `false` to disable pagination. Set to `true` to enable pagination with a default limit (10).
     */
    @property({ type: Object })
    pageSize: boolean | number = false;

    override render() {
        return (
            <Mutations
                variant={this.variant}
                sequenceType={this.sequenceType}
                views={this.views}
                width={this.width}
                height={this.height}
                headline={this.headline}
                pageSize={this.pageSize}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-component': MutationsComponent;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type VariantsMatches = Expect<Equals<typeof MutationsComponent.prototype.variant, LapisFilter>>;
type SequenceTypeMatches = Expect<Equals<typeof MutationsComponent.prototype.sequenceType, SequenceType>>;
type ViewsMatches = Expect<Equals<typeof MutationsComponent.prototype.views, View[]>>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
