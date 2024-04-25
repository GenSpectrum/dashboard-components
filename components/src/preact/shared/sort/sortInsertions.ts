import { comparePositions, compareSegments } from './sortSubstitutionsAndDeletions';
import { type Insertion } from '../../../utils/mutations';

export const sortInsertions = (a: Insertion, b: Insertion) => {
    if (a.segment !== b.segment) {
        return compareSegments(a.segment, b.segment);
    }

    if (a.position !== b.position) {
        return comparePositions(a.position, b.position);
    }

    return a.insertedSymbols.localeCompare(b.insertedSymbols);
};
