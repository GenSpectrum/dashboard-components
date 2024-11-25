import { isSingleSegmented, type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import type { SequenceType } from '../../types';

export const sequenceTypeFromSegment = (
    possibleSegment: string | undefined,
    referenceGenome: ReferenceGenome,
): SequenceType | undefined => {
    if (possibleSegment === undefined) {
        return isSingleSegmented(referenceGenome) ? 'nucleotide' : undefined;
    }

    const segment = possibleSegment.toLowerCase();
    if (referenceGenome.nucleotideSequences.some((sequence) => sequence.name.toLowerCase() === segment)) {
        return 'nucleotide';
    }

    if (referenceGenome.genes.some((gene) => gene.name.toLowerCase() === segment)) {
        return 'amino acid';
    }
    return undefined;
};
