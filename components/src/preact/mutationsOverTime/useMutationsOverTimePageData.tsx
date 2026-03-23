import { useMemo, useRef } from 'preact/hooks';

import type { TemporalDataMap } from './MutationOverTimeData';
import { type MutationsOverTimeMetadata, queryMutationsOverTimePage } from '../../query/queryMutationsOverTime';
import { type LapisFilter } from '../../types';
import { Map2dView } from '../../utils/map2d';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { useQuery } from '../useQuery';

type PageData = TemporalDataMap<Substitution | Deletion>;

type MutationsOverTimePageQuery = { isLoading: true; data: null } | { isLoading: false; data: PageData };

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

    const cache = useRef<Map<string, PageData>>(new Map());

    const {
        data: pageData,
        error,
        isLoading,
    } = useQuery(async () => {
        const cacheKey = JSON.stringify(pageMutationCodes);
        const cachedData = cache.current.get(cacheKey);
        if (cachedData !== undefined) {
            return cachedData;
        }

        const newData = await queryMutationsOverTimePage(
            lapisFilter,
            lapis,
            lapisDateField,
            sequenceType,
            requestedDateRanges,
            pageMutationCodes,
        );
        cache.current.set(cacheKey, newData);
        return newData;
    }, [lapisFilter, lapis, lapisDateField, sequenceType, requestedDateRanges, pageMutationCodes]);

    if (error) {
        throw error;
    }

    return useMemo(() => {
        if (isLoading) {
            return { isLoading: true, data: null };
        }

        if (!hideGaps) {
            return { isLoading: false, data: pageData };
        }

        const view = new Map2dView(pageData);
        view.getSecondAxisKeys()
            .filter((dateRange) => {
                const vals = view.getColumn(dateRange);
                return !vals.some((v) => (v?.type === 'value' || v?.type === 'valueWithCoverage') && v.totalCount > 0);
            })
            .forEach((dateRange) => view.deleteColumn(dateRange));

        return { isLoading: false, data: view };
    }, [pageData, hideGaps, isLoading]);
}
