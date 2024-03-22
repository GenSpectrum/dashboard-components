import { customElement, property } from 'lit/decorators.js';
import { LapisFilter, SequenceType } from '../../types';
import { Mutations, View } from '../../preact/mutations/mutations';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

@customElement('gs-mutations-component')
export class MutationsComponent extends PreactLitAdapterWithGridJsStyles {
    @property({ type: Object })
    variant: LapisFilter = { displayName: '' };

    @property({ type: String })
    sequenceType: SequenceType = 'nucleotide';

    @property({ type: Array })
    views: View[] = ['table', 'grid'];

    override render() {
        return <Mutations variant={this.variant} sequenceType={this.sequenceType} views={this.views} />;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-component': MutationsComponent;
    }
}
