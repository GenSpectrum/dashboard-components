import { customElement, property } from 'lit/decorators.js';

import {
    MutationComparison,
    type MutationComparisonVariant,
    type View,
} from '../../preact/mutationComparison/mutation-comparison';
import { type SequenceType } from '../../types';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

@customElement('gs-mutation-comparison-component')
export class MutationComparisonComponent extends PreactLitAdapterWithGridJsStyles {
    @property({ type: Array })
    variants: MutationComparisonVariant[] = [];

    @property({ type: String })
    sequenceType: SequenceType = 'nucleotide';

    @property({ type: Array })
    views: View[] = ['table'];

    override render() {
        return <MutationComparison variants={this.variants} sequenceType={this.sequenceType} views={this.views} />;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutation-comparison-component': MutationComparisonComponent;
    }
}
