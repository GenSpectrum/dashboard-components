import { type MutationOverTimeDataGroupedByMutation } from '../../query/queryMutationsOverTime';
import type { DisplayedSegment } from '../components/SegmentSelector';
import type { DisplayedMutationType } from '../components/mutation-type-selector';

export function getFilteredMutationOverTimeData(
    data: MutationOverTimeDataGroupedByMutation,
    displayedSegments: DisplayedSegment[],
    displayedMutationTypes: DisplayedMutationType[],
    proportionInterval: { min: number; max: number },
) {
    const filteredData = data.copy();
    filterDisplayedSegments(displayedSegments, filteredData);
    filterMutationTypes(displayedMutationTypes, filteredData);
    filterProportion(filteredData, proportionInterval);

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
    proportionInterval: {
        min: number;
        max: number;
    },
) {
    data.getFirstAxisKeys().forEach((mutation) => {
        const row = data.getRow(mutation, { count: 0, proportion: 0 });
        if (
            !row.some(
                (value) => value.proportion >= proportionInterval.min && value.proportion <= proportionInterval.max,
            )
        ) {
            data.deleteRow(mutation);
        }
    });
}
