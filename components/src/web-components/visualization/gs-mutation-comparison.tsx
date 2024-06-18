import { customElement, property } from 'lit/decorators.js';

import { MutationComparison, type MutationComparisonProps } from '../../preact/mutationComparison/mutation-comparison';
import { type Equals, type Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component allows to compare mutations between different variants.
 * A variant is defined by its LAPIS filter.
 *
 * It only shows substitutions and deletions, it does not show insertions.
 *
 * ## Views
 *
 * ### Table View
 *
 * The table view shows mutations
 * and the proportions with which the mutation occurs in the respective variant.
 * It only shows mutations that are present in at least one of the variants
 * and where the proportion is within the selected proportion interval for at least one variant.
 *
 * ### Venn View
 *
 * The Venn view shows the overlap of mutations between the variants in a Venn diagram.
 * A variant is considered to have a certain mutation,
 * if the proportion of the mutation in the variant is within the selected proportion interval.
 * Thus, changing the proportion interval may change a mutations from being "common" between variant
 * to being "for one variant only".
 */
@customElement('gs-mutation-comparison')
export class MutationComparisonComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * Required.
     *
     * An array of variants to compare.
     *
     * The `lapisFilter` will be sent as is to LAPIS to filter the mutation data.
     * It must be a valid LAPIS filter object.
     *
     * The `displayName` will be used as the label for the variant in the views.
     * It should be human-readable.
     */
    @property({ type: Array })
    variants: {
        lapisFilter: Record<string, string | number | null | boolean>;
        displayName: string;
    }[] = [];

    /**
     * The type of the sequence for which the mutations should be shown.
     */
    @property({ type: String })
    sequenceType: 'nucleotide' | 'amino acid' = 'nucleotide';

    /**
     * A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: ('table' | 'venn')[] = ['table'];

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboards/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboards/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string = '700px';

    /**
     * The headline of the component. Set to an empty string to hide the headline.
     */
    @property({ type: String })
    headline: string = 'Mutation comparison';

    /**
     * The maximum number of rows to display in the table view.
     * Set to `false` to disable pagination. Set to `true` to enable pagination with a default limit (10).
     */
    @property({ type: Object })
    pageSize: boolean | number = false;

    override render() {
        return (
            <MutationComparison
                variants={this.variants}
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
        'gs-mutation-comparison-component': MutationComparisonComponent;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type VariantsMatches = Expect<
    Equals<typeof MutationComparisonComponent.prototype.variants, MutationComparisonProps['variants']>
>;
type SequenceTypeMatches = Expect<
    Equals<typeof MutationComparisonComponent.prototype.sequenceType, MutationComparisonProps['sequenceType']>
>;
type ViewsMatches = Expect<
    Equals<typeof MutationComparisonComponent.prototype.views, MutationComparisonProps['views']>
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
