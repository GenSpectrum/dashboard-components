import leafletStyle from 'leaflet/dist/leaflet.css?inline';
import { unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { GenomeDataViewer, type GenomeDataViewerProps } from '../../preact/genomeViewer/genome-data-viewer';
import leafletStyleModifications from '../../preact/sequencesByLocation/leafletStyleModifications.css?inline';
import type { Equals, Expect } from '../../utils/typeAssertions';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

const leafletCss = unsafeCSS(leafletStyle);
const leafletModificationsCss = unsafeCSS(leafletStyleModifications);

/**
 * ## Context
 *
 * This component shows the CDS of a genome using a gff3 file as input.
 *
 */
@customElement('gs-genome-data-viewer')
export class GenomeDataViewerComponent extends PreactLitAdapterWithGridJsStyles {
    static override styles = [...PreactLitAdapterWithGridJsStyles.styles, leafletCss, leafletModificationsCss];

    /**
     * Required
     *
     * The source of the gff3 file. See component level docs for more information.
     */
    @property({ type: String })
    gff3Source!: string;

    /**
     * Required
     *
     * The source of the gff3 file. See component level docs for more information.
     */
    @property({ type: Number })
    genomeLength!: number;

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

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type GenomeLengthMatches = Expect<
    Equals<typeof GenomeDataViewerComponent.prototype.genomeLength, GenomeDataViewerProps['genomeLength']>
>;
type gff3SourceMatches = Expect<
    Equals<typeof GenomeDataViewerComponent.prototype.gff3Source, GenomeDataViewerProps['gff3Source']>
>;
type WidthMatches = Expect<Equals<typeof GenomeDataViewerComponent.prototype.width, GenomeDataViewerProps['width']>>;
type HeightMatches = Expect<Equals<typeof GenomeDataViewerComponent.prototype.height, GenomeDataViewerProps['height']>>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
