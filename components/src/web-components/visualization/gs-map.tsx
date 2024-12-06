import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Map, type MapSource } from '../../preact/map/map';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * TODO
 */
@customElement('gs-map')
export class MapComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * The filter to apply to the data.
     * It must be a valid LAPIS filter object.
     */
    @property({ type: Object })
    mapSource: MapSource = {};

    override render() {
        return <Map mapSource={this.mapSource} />;
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
