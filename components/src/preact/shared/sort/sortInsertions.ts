import { comparePositions, compareSegments } from './sortSubstitutionsAndDeletions';
import { type InsertionClass } from '../../../utils/mutations';

export const sortInsertions = (a: InsertionClass, b: InsertionClass) => {
    if (a.segment !== b.segment) {
        return compareSegments(a.segment, b.segment);
    }

    if (a.position !== b.position) {
        return comparePositions(a.position, b.position);
    }

    return a.insertedSymbols.localeCompare(b.insertedSymbols);
};
