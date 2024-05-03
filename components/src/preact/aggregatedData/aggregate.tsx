import { type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { AggregateTable } from './aggregate-table';
import { type AggregateData, queryAggregateData } from '../../query/queryAggregateData';
import { type LapisFilter } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import Info from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer, type Size } from '../components/resize-container';
import Tabs from '../components/tabs';
import { useQuery } from '../useQuery';

export type View = 'table';

export interface AggregateProps {
    filter: LapisFilter;
    fields: string[];
    views: View[];
    size?: Size;
}

export const Aggregate: FunctionComponent<AggregateProps> = ({ fields, views, filter, size }) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(async () => {
        return queryAggregateData(filter, fields, lapis);
    }, [filter, fields, lapis]);

    const headline = 'Aggregate';

    if (isLoading) {
        return (
            <Headline heading={headline}>
                <LoadingDisplay />
            </Headline>
        );
    }

    if (error !== null) {
        return (
            <Headline heading={headline}>
                <ErrorDisplay error={error} />
            </Headline>
        );
    }

    if (data === null) {
        return (
            <Headline heading={headline}>
                <NoDataDisplay />
            </Headline>
        );
    }

    return (
        <ResizeContainer size={size} defaultSize={{ height: '700px', width: '100%' }}>
            <Headline heading={headline}>
                <AggregatedDataTabs data={data} views={views} fields={fields} />
            </Headline>
        </ResizeContainer>
    );
};

type AggregatedDataTabsProps = {
    data: AggregateData;
    fields: string[];
    views: View[];
};

const AggregatedDataTabs: FunctionComponent<AggregatedDataTabsProps> = ({ data, views, fields }) => {
    const getTab = (view: View) => {
        switch (view) {
            case 'table':
                return {
                    title: 'Table',
                    content: <AggregateTable data={data} fields={fields} />,
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
            <Info className='mx-1' content='Info for aggregate' />
        </div>
    );
};
