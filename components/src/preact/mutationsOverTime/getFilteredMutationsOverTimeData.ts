import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { type SubstitutionOrDeletionEntry } from '../../types';
import { Map2dView } from '../../utils/map2d';
import type { Deletion, Substitution } from '../../utils/mutations';
import type { DisplayedMutationType } from '../components/mutation-type-selector';
import type { DisplayedSegment } from '../components/segment-selector';

export function getFilteredMutationOverTimeData(
    data: MutationOverTimeDataMap,
    overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[],
    displayedSegments: DisplayedSegment[],
    displayedMutationTypes: DisplayedMutationType[],
    proportionInterval: { min: number; max: number },
) {
    const filteredData = new Map2dView(data);

    const mutationsToFilterOut = overallMutationData.filter((entry) => {
        if (entry.proportion < proportionInterval.min || entry.proportion > proportionInterval.max) {
            return true;
        }
        if (displayedSegments.some((segment) => segment.segment === entry.mutation.segment && !segment.checked)) {
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
