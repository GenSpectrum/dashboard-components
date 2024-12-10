import leafletStyle from 'leaflet/dist/leaflet.css?inline';
import { unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import leafletStyleModifications from '../../preact/map/leafletStyleModifications.css?inline';
import { type MapSource, PrevalenceByLocation } from '../../preact/map/prevalence-by-location';
import { PreactLitAdapter } from '../PreactLitAdapter';

const leafletCss = unsafeCSS(leafletStyle);
const leafletModificationsCss = unsafeCSS(leafletStyleModifications);

/**
 * ## Context
 *
 * TODO
 */
@customElement('gs-prevalence-by-location')
export class PrevalenceByLocationComponent extends PreactLitAdapter {
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
     * The values that LAPIS returns for this field must match the "feature names" (i.e. countries, subdivisions, etc.)
     * in the map data.
     *
     * This component will write a console warning if there is a value in the LAPIS data that did not match on any feature in the map data.
     * If there is a feature in the map data that did not match on any value in the LAPIS data, it will be ignored.
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
     A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: 'map'[] = ['map'];

    /**
     * The initial zoom level of the map.
     */
    @property({ type: Number })
    zoom: number = 1;

    /**
     * Initially shift the center of the map in x direction (longitude).
     *
     * `-180` is the International Date Line with the map shifted to the right, `0` is the prime meridian,
     * `180` is the International Date Line with the map shifted to the left.
     */
    @property({ type: Number })
    offsetX: number = 0;

    /**
     * Initially shift the center of the map in y direction (latitude).
     *
     * `-90` is the South Pole, `0` is the equator, `90` is the North Pole.
     */
    @property({ type: Number })
    offsetY: number = 0;

    override render() {
        return (
            <PrevalenceByLocation
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
        'gs-prevalence-by-location': PrevalenceByLocationComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-prevalence-by-location': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
// TODO
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
