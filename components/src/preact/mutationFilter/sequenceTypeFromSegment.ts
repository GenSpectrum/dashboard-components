import type { ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import type { SequenceType } from '../../types';

export const sequenceTypeFromSegment = (
    possibleSegment: string | undefined,
    referenceGenome: ReferenceGenome,
): SequenceType | undefined => {
    if (possibleSegment === undefined) {
        return referenceGenome.nucleotideSequences.length === 1 ? 'nucleotide' : undefined;
    }

    if (referenceGenome.nucleotideSequences.some((sequence) => sequence.name === possibleSegment)) {
        return 'nucleotide';
    }

    if (referenceGenome.genes.some((gene) => gene.name === possibleSegment)) {
        return 'amino acid';
    }
    return undefined;
};
