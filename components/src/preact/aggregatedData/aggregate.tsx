import { type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { AggregateTable } from './aggregate-table';
import { type AggregateData, queryAggregateData } from '../../query/queryAggregateData';
import { type LapisFilter } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
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
    filter: LapisFilter;
    fields: string[];
    views: View[];
    initialSortField: string;
    initialSortDirection: 'ascending' | 'descending';
    pageSize: boolean | number;
};

export const Aggregate: FunctionComponent<AggregateProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <AggregateInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const AggregateInner: FunctionComponent<AggregateProps> = (componentProps) => {
    const { fields, filter, initialSortField, initialSortDirection } = componentProps;
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryAggregateData(filter, fields, lapis, { field: initialSortField, direction: initialSortDirection });
    }, [filter, fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <AggregatedDataTabs data={data} originalComponentProps={componentProps} />;
};

type AggregatedDataTabsProps = {
    data: AggregateData;
    originalComponentProps: AggregateProps;
};

const AggregatedDataTabs: FunctionComponent<AggregatedDataTabsProps> = ({ data, originalComponentProps }) => {
    const getTab = (view: View) => {
        switch (view) {
            case 'table':
                return {
                    title: 'Table',
                    content: (
                        <AggregateTable
                            data={data}
                            fields={originalComponentProps.fields}
                            pageSize={originalComponentProps.pageSize}
                        />
                    ),
                };
        }
    };

    const tabs = originalComponentProps.views.map((view) => getTab(view));

    return <Tabs tabs={tabs} toolbar={<Toolbar data={data} originalComponentProps={originalComponentProps} />} />;
};

type ToolbarProps = {
    data: AggregateData;
    originalComponentProps: AggregateProps;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({ data, originalComponentProps }) => {
    return (
        <div class='flex flex-row'>
            <CsvDownloadButton className='mx-1 btn btn-xs' getData={() => data} filename='aggregate.csv' />
            <AggregateInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </div>
    );
};

type AggregateInfoProps = {
    originalComponentProps: AggregateProps;
};

const AggregateInfo: FunctionComponent<AggregateInfoProps> = ({ originalComponentProps }) => {
    const lapis = useContext(LapisUrlContext);
    return (
        <Info>
            <InfoHeadline1>Aggregated data</InfoHeadline1>
            <InfoParagraph>
                This table shows the number and proportion of sequences stratified by the following fields:{' '}
                {originalComponentProps.fields.join(', ')}. The proportion is calculated with respect to the total count
                within the filtered dataset.
            </InfoParagraph>
            <InfoComponentCode componentName='aggregate' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};
