import { customElement, property } from 'lit/decorators.js';
import { SequenceType } from '../../types';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';
import {
    MutationComparison,
    MutationComparisonVariant,
    View,
} from '../../preact/mutationComparison/mutation-comparison';

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
