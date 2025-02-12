import { createContext } from 'preact';

import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';

const UNINITIALIZED_SEQUENCE = '__uninitialized__';

export const INITIAL_REFERENCE_GENOMES = {
    nucleotideSequences: [{ name: UNINITIALIZED_SEQUENCE, sequence: '' }],
    genes: [],
};

export const ReferenceGenomeContext = createContext<ReferenceGenome>(INITIAL_REFERENCE_GENOMES);

export function isNotInitialized(referenceGenome: ReferenceGenome) {
    return (
        referenceGenome.genes.length === 0 &&
        referenceGenome.nucleotideSequences.length === 1 &&
        referenceGenome.nucleotideSequences[0].name === UNINITIALIZED_SEQUENCE
    );
}
