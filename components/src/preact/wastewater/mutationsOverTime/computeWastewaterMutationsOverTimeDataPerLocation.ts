import { queryWastewaterMutationsOverTime, type WastewaterData } from '../../../query/queryWastewaterMutationsOverTime';
import type { LapisFilter, SequenceType } from '../../../types';
import { SortedMap2d } from '../../../utils/map2d';
import { compareTemporal, type TemporalClass } from '../../../utils/temporalClass';
import {
    BaseMutationOverTimeDataMap,
    type MutationOverTimeDataMap,
} from '../../mutationsOverTime/MutationOverTimeData';
import { sortSubstitutionsAndDeletions } from '../../shared/sort/sortSubstitutionsAndDeletions';

export async function computeWastewaterMutationsOverTimeDataPerLocation(
    lapis: string,
    lapisFilter: LapisFilter,
    sequenceType: SequenceType,
    signal?: AbortSignal,
) {
    const data = await queryWastewaterMutationsOverTime(lapis, lapisFilter, signal);

    return groupMutationDataByLocation(data, sequenceType);
}

export function groupMutationDataByLocation(data: WastewaterData, sequenceType: 'nucleotide' | 'amino acid') {
    const locationMap = new Map<string, MutationOverTimeDataMap<TemporalClass>>();
    // Track all unique mutations and dates per location for backfilling
    const locationMutations = new Map<string, Set<string>>();
    const locationDates = new Map<string, Set<string>>();

    // First pass: populate sparse data and track all keys
    for (const row of data) {
        if (!locationMap.has(row.location)) {
            locationMap.set(row.location, new BaseMutationOverTimeDataMap<TemporalClass>());
            locationMutations.set(row.location, new Set());
            locationDates.set(row.location, new Set());
        }
        const map = locationMap.get(row.location)!;
        const mutations = locationMutations.get(row.location)!;
        const dates = locationDates.get(row.location)!;

        const mutationFrequencies =
            sequenceType === 'nucleotide' ? row.nucleotideMutationFrequency : row.aminoAcidMutationFrequency;
        for (const mutation of mutationFrequencies) {
            dates.add(row.date.dateString);
            mutations.add(mutation.mutation.code);
            map.set(
                mutation.mutation,
                row.date,
                mutation.proportion !== null ? { type: 'wastewaterValue', proportion: mutation.proportion } : null,
            );
        }
    }

    // Second pass: backfill missing cells with explicit null
    for (const [location, map] of locationMap.entries()) {
        const allMutations = Array.from(locationMutations.get(location)!);
        const allDates = Array.from(locationDates.get(location)!).map((dateStr) => map.keysSecondAxis.get(dateStr)!);

        for (const mutationCode of allMutations) {
            const mutation = map.keysFirstAxis.get(mutationCode)!;
            for (const date of allDates) {
                if (map.get(mutation, date) === undefined) {
                    map.set(mutation, date, null);
                }
            }
        }
    }

    return [...locationMap.entries()].map(([location, data]) => ({
        location,
        data: new SortedMap2d(
            data,
            (a, b) => sortSubstitutionsAndDeletions(a, b),
            (a, b) => compareTemporal(a, b),
        ),
    }));
}
