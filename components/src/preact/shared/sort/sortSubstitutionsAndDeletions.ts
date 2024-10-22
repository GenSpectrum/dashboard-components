import { DeletionClass, type SubstitutionClass } from '../../../utils/mutations';

export const sortSubstitutionsAndDeletions = (
    a: SubstitutionClass | DeletionClass,
    b: SubstitutionClass | DeletionClass,
) => {
    if (a.segment !== b.segment) {
        return compareSegments(a.segment, b.segment);
    }

    if (a.position !== b.position) {
        return comparePositions(a.position, b.position);
    }

    const aIsDeletion = a instanceof DeletionClass;
    const bIsDeletion = b instanceof DeletionClass;

    if (aIsDeletion !== bIsDeletion) {
        return aIsDeletion ? 1 : -1;
    }

    if (!aIsDeletion && !bIsDeletion) {
        if (a.substitutionValue !== b.substitutionValue) {
            return compareSubstitutionValues(a.substitutionValue, b.substitutionValue);
        }
    }

    return 0;
};

export const compareSegments = (a: string | undefined, b: string | undefined) => {
    if (a === undefined) {
        return -1;
    }
    if (b === undefined) {
        return 1;
    }
    return a.localeCompare(b);
};

export const comparePositions = (a: number, b: number) => {
    return a - b;
};

const compareSubstitutionValues = (a: string | undefined, b: string | undefined) => {
    if (a === undefined) {
        return -1;
    }
    if (b === undefined) {
        return 1;
    }
    return a.localeCompare(b);
};
