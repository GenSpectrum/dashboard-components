import { customElement, property } from 'lit/decorators.js';

import { Mutations, type View } from '../../preact/mutations/mutations';
import { type LapisFilter, type SequenceType } from '../../types';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

@customElement('gs-mutations-component')
export class MutationsComponent extends PreactLitAdapterWithGridJsStyles {
    @property({ type: Object })
    variant: LapisFilter = { displayName: '' };

    @property({ type: String })
    sequenceType: SequenceType = 'nucleotide';

    @property({ type: Array })
    views: View[] = ['table', 'grid'];

    /**
     * The size of the component.
     *
     * If not set, the component will take the full width of its container with height 700px.
     *
     * The width and height should be a string with a unit in css style, e.g. '100%', '500px' or '50vh'.
     * If the unit is %, the size will be relative to the container of the component.
     */
    @property({ type: Object })
    size: { width?: string; height?: string } | undefined = undefined;

    override render() {
        return (
            <Mutations variant={this.variant} sequenceType={this.sequenceType} views={this.views} size={this.size} />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutations-component': MutationsComponent;
    }
}
