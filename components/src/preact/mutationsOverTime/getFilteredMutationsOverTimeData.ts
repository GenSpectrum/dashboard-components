import z from 'zod';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type SequenceType, type SubstitutionOrDeletionEntry } from '../../types';
import { Map2dView } from '../../utils/map2d';
import type { Deletion, Mutation, Substitution } from '../../utils/mutations';
import { type useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
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
    mutationFilterValue: string;
    sequenceType: SequenceType;
    annotationProvider: ReturnType<typeof useMutationAnnotationsProvider>;
};

export function getFilteredMutationOverTimeData({
    data,
    overallMutationData,
    displayedSegments,
    displayedMutationTypes,
    proportionInterval,
    displayMutations,
    mutationFilterValue,
    sequenceType,
    annotationProvider,
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

        if (applySearchFilter(entry.mutation, sequenceType, mutationFilterValue, annotationProvider)) {
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

export function applySearchFilter(
    mutation: Mutation,
    sequenceType: SequenceType,
    filterValue: string,
    annotationProvider: ReturnType<typeof useMutationAnnotationsProvider>,
) {
    if (filterValue === '') {
        return false;
    }

    if (mutation.code.includes(filterValue)) {
        return false;
    }

    const mutationAnnotations = annotationProvider(mutation, sequenceType);
    if (mutationAnnotations === undefined || mutationAnnotations.length === 0) {
        return true;
    }
    return !mutationAnnotations.some(
        (annotation) =>
            annotation.description.includes(filterValue) ||
            annotation.name.includes(filterValue) ||
            annotation.symbol.includes(filterValue),
    );
}
