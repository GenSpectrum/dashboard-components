import { useContext } from 'preact/hooks';

import { queryNumberOfSequencesOverTime } from '../../query/queryNumberOfSequencesOverTime';
import type { NamedLapisFilter, TemporalGranularity } from '../../types';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import Headline from '../components/headline';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

export interface NumberSequencesOverTimeProps extends NumberSequencesOverTimeInnerProps {
    width: string;
    height: string;
    headline?: string;
}

interface NumberSequencesOverTimeInnerProps {
    lapisFilter: NamedLapisFilter | NamedLapisFilter[];
    lapisDateField: string;
    views: ('bar' | 'line' | 'table')[];
    granularity: TemporalGranularity;
    smoothingWindow: number;
}

export function NumberSequencesOverTime({ width, height, headline, ...innerProps }: NumberSequencesOverTimeProps) {
    const size = { height, width };

    return (
        <ErrorBoundary size={size} headline={headline}>
            <ResizeContainer size={size}>
                <Headline heading={headline}>
                    <NumberSequencesOverTimeInner {...innerProps} />
                </Headline>
            </ResizeContainer>
        </ErrorBoundary>
    );
}

const NumberSequencesOverTimeInner = ({
    lapisFilter,
    granularity,
    smoothingWindow,
    lapisDateField,
}: NumberSequencesOverTimeInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(() =>
        queryNumberOfSequencesOverTime(lapis, lapisFilter, lapisDateField, granularity, smoothingWindow),
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <div>{JSON.stringify(data)}</div>;
};
