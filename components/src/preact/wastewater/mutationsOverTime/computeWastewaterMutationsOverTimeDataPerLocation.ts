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
    for (const row of data) {
        if (!locationMap.has(row.location)) {
            locationMap.set(row.location, new BaseMutationOverTimeDataMap<TemporalClass>());
        }
        const map = locationMap.get(row.location)!;

        const mutationFrequencies =
            sequenceType === 'nucleotide' ? row.nucleotideMutationFrequency : row.aminoAcidMutationFrequency;
        for (const mutation of mutationFrequencies) {
            map.set(
                mutation.mutation,
                row.date,
                mutation.proportion !== null
                    ? { proportion: mutation.proportion, count: null, totalCount: null }
                    : null,
            );
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
