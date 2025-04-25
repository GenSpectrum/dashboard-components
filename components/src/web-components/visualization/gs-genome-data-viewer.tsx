import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { GenomeDataViewer } from '../../preact/genomeViewer/genome-data-viewer';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * ## Context
 *
 * This component shows the Coding Sequence (CDS) of a genome using a gff3 file as input.
 * The CDS shows which parts of the genome are translated into proteins.
 *
 */
@customElement('gs-genome-data-viewer')
export class GenomeDataViewerComponent extends PreactLitAdapter {
    /**
     * Required
     *
     * The source of the gff3 file. Any spec-compliant gff3 should be accepted, however we use the same format as Nextclade.
     * See https://docs.nextstrain.org/projects/nextclade/en/stable/user/input-files/03-genome-annotation.html for more information.
     * We only use the CDS and gene features from the gff3 file, if you have other features in the gff3 file they will be ignored.
     * Also note that if a CDS has a gene feature as a parent, the gene feature will be ignored.
     */
    @property({ type: String })
    gff3Source: string = '';

    /**
     * The length of the genome, if this is not given it will be computed from the `sequence-region` line of the start of the gff3 file.
     */
    @property({ type: Number })
    genomeLength: number | undefined = 0;

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/concepts-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return <GenomeDataViewer gff3Source={this.gff3Source} genomeLength={this.genomeLength} width={this.width} />;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-genome-data-viewer': GenomeDataViewerComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-genome-data-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
