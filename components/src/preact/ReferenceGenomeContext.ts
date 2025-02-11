import { createContext } from 'preact';

import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';

const UNINITIALIZED_SEQUENCE = '__uninitialized__';

export const ReferenceGenomeContext = createContext<ReferenceGenome>({
    nucleotideSequences: [{ name: UNINITIALIZED_SEQUENCE, sequence: '' }],
    genes: [],
});

export function isNotInitialized(referenceGenome: ReferenceGenome) {
    return (
        referenceGenome.genes.length === 0 &&
        referenceGenome.nucleotideSequences.length === 1 &&
        referenceGenome.nucleotideSequences[0].name === UNINITIALIZED_SEQUENCE
    );
}
