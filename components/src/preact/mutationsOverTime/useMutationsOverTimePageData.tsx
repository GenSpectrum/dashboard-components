import { useMemo } from 'preact/hooks';

import { type MutationsOverTimeMetadata, queryMutationsOverTimePage } from '../../query/queryMutationsOverTime';
import { type LapisFilter } from '../../types';
import { Map2dView } from '../../utils/map2d';
import { useQuery } from '../useQuery';
import type { TemporalDataMap } from './MutationOverTimeData';
import { type Deletion, type Substitution } from '../../utils/mutations';

type MutationsOverTimePageQuery =
    | { isLoading: true; data: null }
    | { isLoading: false; data: TemporalDataMap<Substitution | Deletion> };

export function useMutationsOverTimePageData(
    filteredMutationCodes: string[],
    pageIndex: number,
    pageSize: number,
    lapisFilter: LapisFilter,
    lapis: string,
    lapisDateField: string,
    sequenceType: 'nucleotide' | 'amino acid',
    requestedDateRanges: MutationsOverTimeMetadata['requestedDateRanges'],
    hideGaps: boolean,
): MutationsOverTimePageQuery {
    const pageMutationCodes = filteredMutationCodes.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    const { data, error, isLoading } = useQuery(
        () =>
            queryMutationsOverTimePage(
                lapisFilter,
                lapis,
                lapisDateField,
                sequenceType,
                requestedDateRanges,
                pageMutationCodes,
            ),
        [lapisFilter, lapis, lapisDateField, sequenceType, requestedDateRanges, pageMutationCodes],
    );

    if (error) {
        throw error;
    }

    return useMemo(() => {
        if (isLoading) {
            return { isLoading: true, data: null };
        }

        if (!hideGaps) {
            return { isLoading: false, data };
        }

        const view = new Map2dView(data);
        view.getSecondAxisKeys()
            .filter((dateRange) => {
                const vals = view.getColumn(dateRange);
                return !vals.some((v) => (v?.type === 'value' || v?.type === 'valueWithCoverage') && v.totalCount > 0);
            })
            .forEach((dateRange) => view.deleteColumn(dateRange));

        return { isLoading: false, data: view };
    }, [data, hideGaps, isLoading]);
}
