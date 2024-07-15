import z from 'zod';

import type { SequenceType } from '../types';

export const referenceGenomeResponse = z.object({
    nucleotideSequences: z.array(
        z.object({
            name: z.string(),
            sequence: z.string(),
        }),
    ),
    genes: z.array(
        z.object({
            name: z.string(),
            sequence: z.string(),
        }),
    ),
});
export type ReferenceGenome = z.infer<typeof referenceGenomeResponse>;

export const getSegmentNames = (referenceGenome: ReferenceGenome, sequenceType: SequenceType) => {
    switch (sequenceType) {
        case 'nucleotide': {
            return referenceGenome.nucleotideSequences.map((sequence) => sequence.name);
        }
        case 'amino acid': {
            return referenceGenome.genes.map((gene) => gene.name);
        }
    }
};

export const isSingleSegmented = (referenceGenome: ReferenceGenome) => referenceGenome.nucleotideSequences.length === 1;
