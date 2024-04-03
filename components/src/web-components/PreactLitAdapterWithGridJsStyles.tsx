import { PreactLitAdapter } from './PreactLitAdapter';
import { unsafeCSS } from 'lit';
import gridJsStyle from 'gridjs/dist/theme/mermaid.css?inline';

import 'gridjs/dist/theme/mermaid.css';

const gridJsElementCss = unsafeCSS(gridJsStyle);

export abstract class PreactLitAdapterWithGridJsStyles extends PreactLitAdapter {
    static override styles = [...PreactLitAdapter.styles, gridJsElementCss];
}
