import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

import { MutationAnnotationsContextProvider } from '../../preact/MutationAnnotationsContext';
import { MutationLinkTemplateContextProvider } from '../../preact/MutationLinkTemplateContext';
import { WastewaterMutationsOverTime } from '../../preact/wastewater/mutationsOverTime/wastewater-mutations-over-time';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';
import { type MutationAnnotations, mutationAnnotationsContext } from '../mutation-annotations-context';
import { type MutationLinkTemplate, mutationLinkTemplateContext } from '../mutation-link-template-context';

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
 *
 * @slot infoText - Additional information text to be shown in the info modal (the "?" button).
 *
 * @fires {CustomEvent<undefined>} gs-component-finished-loading
 * Fired when the component has finished loading the required data from LAPIS.
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
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string | undefined = undefined;

    /**
     * The number of rows per page, which can be selected by the user.
     */
    @property({ type: Array })
    pageSizes: number[] | number = [10, 20, 30, 40, 50];

    /**
     * @internal
     */
    @consume({ context: mutationAnnotationsContext, subscribe: true })
    mutationAnnotations: MutationAnnotations = [];

    /**
     * @internal
     */
    @consume({ context: mutationLinkTemplateContext, subscribe: true })
    mutationLinkTemplate: MutationLinkTemplate = {};

    override render() {
        return (
            <MutationAnnotationsContextProvider value={this.mutationAnnotations}>
                <MutationLinkTemplateContextProvider value={this.mutationLinkTemplate}>
                    <WastewaterMutationsOverTime
                        lapisFilter={this.lapisFilter}
                        sequenceType={this.sequenceType}
                        width={this.width}
                        height={this.height}
                        pageSizes={this.pageSizes}
                    />
                </MutationLinkTemplateContextProvider>
            </MutationAnnotationsContextProvider>
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
