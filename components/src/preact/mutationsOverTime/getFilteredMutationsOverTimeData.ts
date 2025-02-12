import z from 'zod';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type SubstitutionOrDeletionEntry } from '../../types';
import { Map2dView } from '../../utils/map2d';
import type { Deletion, Substitution } from '../../utils/mutations';
import type { DisplayedMutationType } from '../components/mutation-type-selector';
import type { DisplayedSegment } from '../components/segment-selector';

export const displayMutationsSchema = z.array(z.string()).min(1);
export type DisplayMutations = z.infer<typeof displayMutationsSchema>;

export type GetFilteredMutationOverTimeDataArgs = {
    data: MutationOverTimeDataMap;
    overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[];
    displayedSegments: DisplayedSegment[];
    displayedMutationTypes: DisplayedMutationType[];
    proportionInterval: { min: number; max: number };
    displayMutations?: DisplayMutations;
};

export function getFilteredMutationOverTimeData({
    data,
    overallMutationData,
    displayedSegments,
    displayedMutationTypes,
    proportionInterval,
    displayMutations,
}: GetFilteredMutationOverTimeDataArgs) {
    const filteredData = new Map2dView(data);

    const displayMutationsSet =
        displayMutations === undefined ? null : new Set(displayMutations.map((it) => it.toUpperCase()));

    const mutationsToFilterOut = overallMutationData.filter((entry) => {
        if (entry.proportion < proportionInterval.min || entry.proportion > proportionInterval.max) {
            return true;
        }
        if (displayedSegments.some((segment) => segment.segment === entry.mutation.segment && !segment.checked)) {
            return true;
        }

        if (displayMutationsSet !== null && !displayMutationsSet.has(entry.mutation.code)) {
            return true;
        }

        return displayedMutationTypes.some(
            (mutationType) => mutationType.type === entry.mutation.type && !mutationType.checked,
        );
    });

    mutationsToFilterOut.forEach((entry) => {
        filteredData.deleteRow(entry.mutation);
    });

    return filteredData;
}
