import { useContext } from 'preact/hooks';
import type { FC } from 'react';

import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import type { SequenceType } from '../../types';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';

type ExampleMutationProps = {
    sequenceType: SequenceType;
    mutationType: 'substitution' | 'insertion';
};

export const ExampleMutation: FC<ExampleMutationProps> = ({ sequenceType, mutationType }) => {
    const referenceGenome = useContext(ReferenceGenomeContext);

    return <b>{getExampleMutation(referenceGenome, sequenceType, mutationType)}</b>;
};

export function getExampleMutation(
    referenceGenome: ReferenceGenome,
    sequenceType: SequenceType,
    mutationType: 'substitution' | 'insertion',
) {
    switch (sequenceType) {
        case 'amino acid': {
            if (referenceGenome.genes.length === 0) {
                return '';
            }

            const firstGene = referenceGenome.genes[0].name;

            switch (mutationType) {
                case 'substitution':
                    return `${firstGene}:57Q`;
                case 'insertion':
                    return `ins_${firstGene}:31:N`;
            }
        }
        // Issue of linter https://github.com/typescript-eslint/typescript-eslint/issues/3455
        // eslint-disable-next-line no-fallthrough
        case 'nucleotide': {
            switch (referenceGenome.nucleotideSequences.length) {
                case 0: {
                    return '';
                }
                case 1: {
                    switch (mutationType) {
                        case 'substitution':
                            return '23T';
                        case 'insertion':
                            return 'ins_1046:A';
                    }
                }
                // Issue of linter https://github.com/typescript-eslint/typescript-eslint/issues/3455
                // eslint-disable-next-line no-fallthrough
                default: {
                    const firstSegment = referenceGenome.nucleotideSequences[0].name;
                    switch (mutationType) {
                        case 'substitution':
                            return `${firstSegment}:23T`;
                        case 'insertion':
                            return `ins_${firstSegment}:10462:A`;
                    }
                }
            }
        }
    }
}
