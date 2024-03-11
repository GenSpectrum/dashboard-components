import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { Grid } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

import style from 'gridjs/dist/theme/mermaid.css?inline';
import { OneDArray, TColumn, TData } from 'gridjs/dist/src/types';
import { ComponentChild } from 'preact';
import { PaginationConfig } from 'gridjs/dist/src/view/plugin/pagination';

const tableFontSize = '12px';

export const tableStyle = {
    table: {
        'font-size': tableFontSize,
    },
    th: {
        padding: '4px',
        textAlign: 'center',
    },
    td: {
        textAlign: 'center',
        padding: '8px',
    },
    footer: {
        'font-size': tableFontSize,
    },
};

@customElement('gs-component-table')
export class ComponentTable extends LitElement {
    @property({ type: Array })
    data: TData = [];

    @property({ type: Array })
    columns: OneDArray<TColumn | string | ComponentChild> = [];

    @property({ type: Object })
    pagination: PaginationConfig | boolean = true;

    private grid: Grid | undefined;

    static override styles = unsafeCSS(style);

    @query('#grid-table') tableContainer!: HTMLElement;

    override firstUpdated() {
        this.grid = new Grid({
            columns: this.columns,
            data: this.data,
            pagination: this.pagination,
            style: tableStyle,
        });

        this.grid.render(this.tableContainer);
    }

    override updated() {
        this.grid?.updateConfig({
            columns: this.columns,
            data: this.data,
            pagination: this.pagination,
        });
    }

    override render() {
        return html` <div id="grid-table"></div> `;
    }
}
