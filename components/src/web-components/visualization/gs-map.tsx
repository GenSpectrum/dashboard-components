import leafletStyle from 'leaflet/dist/leaflet.css?inline';
import { unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import leafletStyleModifications from '../../preact/map/leafletStyleModifications.css?inline';
import { Map, type MapSource } from '../../preact/map/map';
import { PreactLitAdapter } from '../PreactLitAdapter';

const leafletCss = unsafeCSS(leafletStyle);
const leafletModificationsCss = unsafeCSS(leafletStyleModifications);

/**
 * ## Context
 *
 * TODO
 */
@customElement('gs-map')
export class MapComponent extends PreactLitAdapter {
    static override styles = [...PreactLitAdapter.styles, leafletCss, leafletModificationsCss];

    /**
     * Required.
     *
     * LAPIS filter to select the displayed data.
     */
    @property({ type: Object })
    lapisFilter: Record<string, string | number | null | boolean> = {};

    /**
     * The location field to aggregate the data by.
     *
     * TODO values must match map data
     */
    @property({ type: String })
    lapisLocationField: string = '';

    /**
     * TODO
     */
    @property({ type: Object })
    mapSource: MapSource = { type: 'topojson', url: '', topologyObjectsKey: '' };

    /**
     * Enable map navigation (dragging, keyboard navigation, zooming).
     */
    @property({ type: Boolean })
    enableMapNavigation: boolean = true;

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

    /**
     * TODO
     */
    @property({ type: Array })
    views: 'map'[] = ['map'];

    /**
     * TODO
     */
    @property({ type: Number })
    zoom: number = 1;

    /**
     * TODO
     */
    @property({ type: Number })
    offsetX: number = 0;

    /**
     * TODO
     */
    @property({ type: Number })
    offsetY: number = 0;

    override render() {
        return (
            <Map
                lapisFilter={this.lapisFilter}
                lapisLocationField={this.lapisLocationField}
                mapSource={this.mapSource}
                enableMapNavigation={this.enableMapNavigation}
                width={this.width}
                height={this.height}
                views={this.views}
                zoom={this.zoom}
                offsetX={this.offsetX}
                offsetY={this.offsetY}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-map': MapComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-map': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
// TODO
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
