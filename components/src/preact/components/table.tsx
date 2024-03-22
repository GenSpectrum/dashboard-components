import { OneDArray, TColumn, TData } from 'gridjs/dist/src/types';
import { PaginationConfig } from 'gridjs/dist/src/view/plugin/pagination';
import { ComponentChild } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Grid } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

export const tableStyle = {
    table: {
        fontSize: '12px',
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
        fontSize: '12px',
    },
};

interface TableProps {
    data: TData;
    columns: OneDArray<TColumn | string | ComponentChild>;
    pagination: PaginationConfig | boolean;
}

export const Table = ({ data, columns, pagination }: TableProps) => {
    const wrapper = useRef(null);

    useEffect(() => {
        if (wrapper.current === null) {
            return;
        }
        const grid = new Grid({
            columns,
            data,
            style: tableStyle,
            pagination,
        }).render(wrapper.current);

        return () => {
            grid.destroy();
        };
    });

    return <div ref={wrapper} />;
};
