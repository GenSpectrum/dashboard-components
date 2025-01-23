import { customElement, property } from 'lit/decorators.js';

import {
    WastewaterMutationsOverTime,
    type WastewaterMutationsOverTimeProps,
} from '../../preact/wastewater/mutationsOverTime/wastewater-mutations-over-time';
import { type Equals, type Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays mutations for Swiss wastewater data generated within the WISE consortium. It is designed
 * only for this purpose and is not designed to be reused outside the WISE project.
 *
 * It relies on a LAPIS instance that has the fields `nucleotideMutationFrequency` and `aminoAcidMutationFrequency`.
 * Those fields are expected to be JSON strings of the format `{ [mutation]: frequency | null }`
 * (e.g. `{ "A123T": 0.5, "C456G": 0.7, "T789G": null }`).
 *
 * The component will stratify by `location`.
 * Every location will be rendered in a separate tab.
 * The content of the tab is a "mutations over time" grid, similar to the one used in the `gs-mutations-over-time` component.
 *
 * This component also assumes that the LAPIS instance has the field `date` which can be used for the time axis.
 */
@customElement('gs-wastewater-mutations-over-time')
export class WastewaterMutationsOverTimeComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * Required.
     *
     * LAPIS filter to select the displayed data.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | string[] | number | null | boolean | undefined> & {
        nucleotideMutations?: string[];
        aminoAcidMutations?: string[];
        nucleotideInsertions?: string[];
        aminoAcidInsertions?: string[];
    } = {};

    /**
     * Required.
     *
     * Whether to display nucleotide or amino acid mutations.
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

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-wastewater-mutations-over-time': Partial<WastewaterMutationsOverTimeProps>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type LapisFilterMatches = Expect<
    Equals<
        typeof WastewaterMutationsOverTimeComponent.prototype.lapisFilter,
        WastewaterMutationsOverTimeProps['lapisFilter']
    >
>;
type SequenceTypeMatches = Expect<
    Equals<
        typeof WastewaterMutationsOverTimeComponent.prototype.sequenceType,
        WastewaterMutationsOverTimeProps['sequenceType']
    >
>;
type WidthMatches = Expect<
    Equals<typeof WastewaterMutationsOverTimeComponent.prototype.width, WastewaterMutationsOverTimeProps['width']>
>;
type HeightMatches = Expect<
    Equals<typeof WastewaterMutationsOverTimeComponent.prototype.height, WastewaterMutationsOverTimeProps['height']>
>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
