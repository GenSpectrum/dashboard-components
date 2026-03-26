import { useEffect, useMemo, useRef } from 'preact/hooks';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type MutationsOverTimeMetadata, queryMutationsOverTimePage } from '../../query/queryMutationsOverTime';
import { type LapisFilter } from '../../types';
import { Map2dView } from '../../utils/map2d';
import { useQuery } from '../useQuery';

type MutationsOverTimePageQuery = { isLoading: true; data: null } | { isLoading: false; data: MutationOverTimeDataMap };

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

    const cache = useRef<Map<string, MutationOverTimeDataMap>>(new Map());
    useEffect(() => {
        cache.current = new Map(); // make sure the cache doesn't grow indefinitely
    }, [lapisFilter, lapis, lapisDateField, sequenceType, requestedDateRanges]);

    const {
        data: pageData,
        error,
        isLoading,
    } = useQuery(async () => {
        const cacheKey = JSON.stringify({
            lapisFilter,
            lapis,
            lapisDateField,
            sequenceType,
            requestedDateRanges,
            pageMutationCodes,
        });
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

        return { isLoading: false, data: handleHideGaps(pageData, hideGaps) };
    }, [pageData, hideGaps, isLoading]);
}

export function handleHideGaps(data: MutationOverTimeDataMap, hideGaps: boolean) {
    if (!hideGaps) {
        return data;
    }

    const view = new Map2dView(data);
    view.getSecondAxisKeys()
        .filter((dateRange) => {
            const vals = view.getColumn(dateRange);
            return !vals.some((v) => (v?.type === 'value' || v?.type === 'valueWithCoverage') && v.totalCount > 0);
        })
        .forEach((dateRange) => view.deleteColumn(dateRange));
    return view;
}
