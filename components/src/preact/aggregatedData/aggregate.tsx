import { type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { AggregateTable } from './aggregate-table';
import { type AggregateData, queryAggregateData } from '../../query/queryAggregateData';
import { type LapisFilter } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import { Fullscreen } from '../components/fullscreen';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

export type View = 'table';
export type InitialSort = { field: string; direction: 'ascending' | 'descending' };

export type AggregateProps = {
    width: string;
    height: string;
} & AggregateInnerProps;

export interface AggregateInnerProps {
    filter: LapisFilter;
    fields: string[];
    views: View[];
    initialSortField: string;
    initialSortDirection: 'ascending' | 'descending';
    pageSize: boolean | number;
}

export const Aggregate: FunctionComponent<AggregateProps> = ({ width, height, ...innerProps }) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <AggregateInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const AggregateInner: FunctionComponent<AggregateInnerProps> = ({
    fields,
    views,
    filter,
    initialSortField,
    initialSortDirection,
    pageSize,
}) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryAggregateData(filter, fields, lapis, { field: initialSortField, direction: initialSortDirection });
    }, [filter, fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <AggregatedDataTabs data={data} views={views} fields={fields} pageSize={pageSize} />;
};

type AggregatedDataTabsProps = {
    data: AggregateData;
    fields: string[];
    views: View[];
    pageSize: boolean | number;
};

const AggregatedDataTabs: FunctionComponent<AggregatedDataTabsProps> = ({ data, views, fields, pageSize }) => {
    const getTab = (view: View) => {
        switch (view) {
            case 'table':
                return {
                    title: 'Table',
                    content: <AggregateTable data={data} fields={fields} pageSize={pageSize} />,
                };
        }
    };

    const tabs = views.map((view) => getTab(view));

    return <Tabs tabs={tabs} toolbar={<Toolbar data={data} />} />;
};

type ToolbarProps = {
    data: AggregateData;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({ data }) => {
    return (
        <div class='flex flex-row'>
            <CsvDownloadButton className='mx-1 btn btn-xs' getData={() => data} filename='aggregate.csv' />
            <Info>Info for aggregate</Info>
            <Fullscreen />
        </div>
    );
};
