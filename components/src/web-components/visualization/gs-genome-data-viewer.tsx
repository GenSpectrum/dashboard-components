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
     * The source of the gff3 file. See component level docs for more information.
     */
    @property({ type: String })
    gff3Source: string = '';

    /**
     * Required
     *
     * The source of the gff3 file. See component level docs for more information.
     */
    @property({ type: Number })
    genomeLength: number = 0;

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
    height: string = '100%';

    override render() {
        return (
            <GenomeDataViewer
                gff3Source={this.gff3Source}
                genomeLength={this.genomeLength}
                width={this.width}
                height={this.height}
            />
        );
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
            'gs-sequences-by-location': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
