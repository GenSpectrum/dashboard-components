import z from 'zod';

import { type SequenceType, type SubstitutionOrDeletionEntry } from '../../types';
import type { Deletion, Mutation, Substitution } from '../../utils/mutations';
import { type useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
import type { DisplayedMutationType } from '../components/mutation-type-selector';
import type { DisplayedSegment } from '../components/segment-selector';

export const displayMutationsSchema = z.array(z.string(), {
    errorMap: () => ({ message: `invalid display mutations` }),
});

export type MutationFilter = {
    textFilter: string;
    annotationNameFilter: Set<string>;
};

export type GetFilteredMutationOverTimeDataArgs = {
    overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[];
    displayedSegments: DisplayedSegment[];
    displayedMutationTypes: DisplayedMutationType[];
    proportionInterval: { min: number; max: number };
    mutationFilterValue: MutationFilter;
    sequenceType: SequenceType;
    annotationProvider: ReturnType<typeof useMutationAnnotationsProvider>;
};

export function getFilteredMutationOverTimeData({
    overallMutationData,
    displayedSegments,
    displayedMutationTypes,
    proportionInterval,
    mutationFilterValue,
    sequenceType,
    annotationProvider,
}: GetFilteredMutationOverTimeDataArgs): string[] {
    return overallMutationData
        .filter((entry) => {
            if (entry.proportion < proportionInterval.min || entry.proportion > proportionInterval.max) {
                return false;
            }
            if (displayedSegments.some((segment) => segment.segment === entry.mutation.segment && !segment.checked)) {
                return false;
            }

            if (
                mutationOrAnnotationDoNotMatchFilter(
                    entry.mutation,
                    sequenceType,
                    mutationFilterValue,
                    annotationProvider,
                )
            ) {
                return false;
            }
            return !displayedMutationTypes.some(
                (mutationType) => mutationType.type === entry.mutation.type && !mutationType.checked,
            );
        })
        .map((e) => e.mutation.code);
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
