import z from 'zod';

import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type SequenceType, type SubstitutionOrDeletionEntry } from '../../types';
import { Map2dView } from '../../utils/map2d';
import type { Deletion, Mutation, Substitution } from '../../utils/mutations';
import { type useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
import type { DisplayedMutationType } from '../components/mutation-type-selector';
import type { DisplayedSegment } from '../components/segment-selector';

export const displayMutationsSchema = z.array(z.string());
export type DisplayMutations = z.infer<typeof displayMutationsSchema>;

export type MutationFilter = {
    textFilter: string;
    annotationNameFilter: Set<string>;
};

export type GetFilteredMutationOverTimeDataArgs = {
    data: MutationOverTimeDataMap;
    overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[];
    displayedSegments: DisplayedSegment[];
    displayedMutationTypes: DisplayedMutationType[];
    proportionInterval: { min: number; max: number };
    hideGaps: boolean;
    displayMutations?: DisplayMutations;
    mutationFilterValue: MutationFilter;
    sequenceType: SequenceType;
    annotationProvider: ReturnType<typeof useMutationAnnotationsProvider>;
};

export function getFilteredMutationOverTimeData({
    data,
    overallMutationData,
    displayedSegments,
    displayedMutationTypes,
    proportionInterval,
    hideGaps,
    mutationFilterValue,
    sequenceType,
    annotationProvider,
}: GetFilteredMutationOverTimeDataArgs) {
    const filteredData = new Map2dView(data);

    const mutationsToFilterOut = overallMutationData.filter((entry) => {
        if (entry.proportion < proportionInterval.min || entry.proportion > proportionInterval.max) {
            return true;
        }
        if (displayedSegments.some((segment) => segment.segment === entry.mutation.segment && !segment.checked)) {
            return true;
        }

        if (
            mutationOrAnnotationDoNotMatchFilter(entry.mutation, sequenceType, mutationFilterValue, annotationProvider)
        ) {
            return true;
        }

        return displayedMutationTypes.some(
            (mutationType) => mutationType.type === entry.mutation.type && !mutationType.checked,
        );
    });

    mutationsToFilterOut.forEach((entry) => {
        filteredData.deleteRow(entry.mutation);
    });

    if (hideGaps) {
        const dateRangesToFilterOut = filteredData.getSecondAxisKeys().filter((dateRange) => {
            const vals = filteredData.getColumn(dateRange);
            return !vals.some((v) => (v?.type === 'value' || v?.type === 'valueWithCoverage') && v.totalCount > 0);
        });
        dateRangesToFilterOut.forEach((dateRange) => filteredData.deleteColumn(dateRange));
    }

    return filteredData;
}

export function mutationOrAnnotationDoNotMatchFilter(
    mutation: Mutation,
    sequenceType: SequenceType,
    mutationFilter: MutationFilter,
    annotationProvider: ReturnType<typeof useMutationAnnotationsProvider>,
) {
    return !(
        mutationOrAnnotationMatchesTextFilter(mutation, sequenceType, mutationFilter.textFilter, annotationProvider) &&
        mutationMatchesAnnotationFilter(mutation, sequenceType, mutationFilter.annotationNameFilter, annotationProvider)
    );
}

function mutationOrAnnotationMatchesTextFilter(
    mutation: Mutation,
    sequenceType: SequenceType,
    textFilter: string,
    annotationProvider: ReturnType<typeof useMutationAnnotationsProvider>,
) {
    if (textFilter === '') {
        return true;
    }

    if (mutation.code.includes(textFilter)) {
        return true;
    }

    const mutationAnnotations = annotationProvider(mutation, sequenceType);
    if (mutationAnnotations === undefined || mutationAnnotations.length === 0) {
        return false;
    }
    return mutationAnnotations.some(
        (annotation) =>
            annotation.description.includes(textFilter) ||
            annotation.name.includes(textFilter) ||
            annotation.symbol.includes(textFilter),
    );
}

function mutationMatchesAnnotationFilter(
    mutation: Mutation,
    sequenceType: SequenceType,
    annotationNameFilter: Set<string>,
    annotationProvider: ReturnType<typeof useMutationAnnotationsProvider>,
) {
    if (annotationNameFilter.size === 0) {
        return true;
    }

    const mutationAnnotations = annotationProvider(mutation, sequenceType);
    if (mutationAnnotations === undefined || mutationAnnotations.length === 0) {
        return false;
    }
    return mutationAnnotations.some((annotation) => annotationNameFilter.has(annotation.name));
}
