import gridJsStyle from 'gridjs/dist/theme/mermaid.css?inline';
import { unsafeCSS } from 'lit';

import { PreactLitAdapter } from './PreactLitAdapter';

const gridJsElementCss = unsafeCSS(gridJsStyle);

export abstract class PreactLitAdapterWithGridJsStyles extends PreactLitAdapter {
    static override styles = [...PreactLitAdapter.styles, gridJsElementCss];
}
