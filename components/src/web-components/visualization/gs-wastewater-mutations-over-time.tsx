import { customElement, property } from 'lit/decorators.js';
import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

import { WastewaterMutationsOverTime } from '../../preact/wastewater/mutationsOverTime/wastewater-mutations-over-time';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays mutations for Swiss wastewater data generated within the WISE consortium. It is designed
 * only for this purpose and is not designed to be reused outside the WISE project.
 */
@customElement('gs-wastewater-mutations-over-time')
export class WastewaterMutationsOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * Required.
     *
     * LAPIS filter to select the displayed data.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | number | null | boolean> = {};

    /**
     * Required.
     *
     * "nucleotide" or "amino acid"
     */
    @property({ type: String })
    sequenceType: 'nucleotide' | 'amino acid' = 'nucleotide';

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

    override render() {
        return (
            <WastewaterMutationsOverTime
                lapisFilter={this.lapisFilter}
                sequenceType={this.sequenceType}
                width={this.width}
                height={this.height}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-wastewater-mutations-over-time': WastewaterMutationsOverTimeComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-wastewater-mutations-over-time': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
