import { type Dataset } from '../../operator/Dataset';
import { type MutationOverTimeDataGroupedByMutation } from '../../query/queryMutationsOverTime';
import { type DeletionEntry, type SubstitutionEntry } from '../../types';
import type { DisplayedMutationType } from '../components/mutation-type-selector';
import type { DisplayedSegment } from '../components/segment-selector';

export function getFilteredMutationOverTimeData(
    data: MutationOverTimeDataGroupedByMutation,
    overallMutationData: Dataset<SubstitutionEntry | DeletionEntry>,
    displayedSegments: DisplayedSegment[],
    displayedMutationTypes: DisplayedMutationType[],
    proportionInterval: { min: number; max: number },
) {
    const filteredData = data.copy();
    filterDisplayedSegments(displayedSegments, filteredData);
    filterMutationTypes(displayedMutationTypes, filteredData);
    filterProportion(filteredData, overallMutationData, proportionInterval);

    return filteredData;
}

export function filterDisplayedSegments(
    displayedSegments: DisplayedSegment[],
    data: MutationOverTimeDataGroupedByMutation,
) {
    displayedSegments.forEach((segment) => {
        if (!segment.checked) {
            data.getFirstAxisKeys().forEach((mutation) => {
                if (mutation.segment === segment.segment) {
                    data.deleteRow(mutation);
                }
            });
        }
    });
}

export function filterMutationTypes(
    displayedMutationTypes: DisplayedMutationType[],
    data: MutationOverTimeDataGroupedByMutation,
) {
    displayedMutationTypes.forEach((mutationType) => {
        if (!mutationType.checked) {
            data.getFirstAxisKeys().forEach((mutation) => {
                if (mutationType.type === mutation.type) {
                    data.deleteRow(mutation);
                }
            });
        }
    });
}

export function filterProportion(
    data: MutationOverTimeDataGroupedByMutation,
    overallMutationData: Dataset<SubstitutionEntry | DeletionEntry>,
    proportionInterval: {
        min: number;
        max: number;
    },
) {
    const overallProportionsByMutation = overallMutationData.content.reduce(
        (acc, { mutation, proportion }) => ({
            ...acc,
            [mutation.toString()]: proportion,
        }),
        {} as Record<string, number>,
    );

    data.getFirstAxisKeys().forEach((mutation) => {
        const overallProportion = overallProportionsByMutation[mutation.toString()] || -1;

        if (overallProportion < proportionInterval.min || overallProportion > proportionInterval.max) {
            data.deleteRow(mutation);
        }
    });
}
