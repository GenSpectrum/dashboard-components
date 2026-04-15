import { useEffect, useMemo, useRef } from 'preact/hooks';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type MutationsOverTimeMetadata, queryMutationsOverTimePage } from '../../query/queryMutationsOverTime';
import { type LapisFilter } from '../../types';
import { Map2dView } from '../../utils/map2d';
import { useQuery } from '../useQuery';

type MutationsOverTimePageQuery = { isLoading: true; data: null } | { isLoading: false; data: MutationOverTimeDataMap };

/**
 * Fetches the data for a single page of the mutations-over-time grid.
 *
 * Rather than loading all mutation data at once, this hook fetches only the rows (mutation codes)
 * that are visible on the current page. The set of visible mutations is determined by
 * `filteredMutationCodes` (all mutations that pass the current client-side filters), sliced to
 * the current page according to `pageIndex` and `pageSize`.
 *
 * Results are cached in a `useRef`-backed Map keyed by the full query context (filter, date
 * ranges, sequence type, and the specific mutation codes on the page), so revisiting a page does
 * not trigger a new network request. The cache is cleared automatically whenever the underlying
 * query inputs change (i.e. `lapisFilter`, `lapis`, `lapisDateField`, `sequenceType`, or
 * `requestedDateRanges`), ensuring stale data is never served after the dataset changes.
 *
 * When `hideGaps` is true, date-range columns that contain no data are removed from the returned
 * view before it is passed to the grid.
 */
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
    const pageMutationCodes = useMemo(
        () => filteredMutationCodes.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
        [filteredMutationCodes, pageIndex, pageSize],
    );

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

/**
 * Returns a new view on `data` where columns (date ranges) that do not contain any data are
 * filtered out. When `hideGaps` is false the original data is returned unchanged.
 */
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
