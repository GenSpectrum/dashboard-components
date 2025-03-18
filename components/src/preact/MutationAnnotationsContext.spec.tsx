import { renderHook } from '@testing-library/preact';
import { type FunctionalComponent } from 'preact';
import { describe, expect, it } from 'vitest';

import { MutationAnnotationsContextProvider, useMutationAnnotationsProvider } from './MutationAnnotationsContext';
import { SubstitutionClass } from '../utils/mutations';
import { type MutationAnnotations } from '../web-components/mutation-annotations-context';

describe('useMutationAnnotation', () => {
    function renderAnnotationsHook(mockAnnotations: MutationAnnotations) {
        const wrapper: FunctionalComponent = ({ children }) => (
            <MutationAnnotationsContextProvider value={mockAnnotations}>{children}</MutationAnnotationsContextProvider>
        );

        const { result } = renderHook(() => useMutationAnnotationsProvider(), { wrapper });
        return result.current;
    }

    describe('annotations for nucleotide mutations', () => {
        const mockAnnotations: MutationAnnotations = [
            {
                name: 'Annotation 1',
                description: 'Description 1',
                symbol: 'A1',
                nucleotideMutations: ['A123', 'A456'],
            },
            {
                name: 'Annotation 2',
                description: 'Description 2',
                symbol: 'A2',
                nucleotideMutations: ['A456', 'A789'],
            },
        ];

        it('should return the correct annotation for a given mutation', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('A123')!, 'nucleotide');

            expect(result).toEqual([mockAnnotations[0]]);
        });

        it('should return the correct annotations if multiple contain a mutation', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('A456')!, 'nucleotide');

            expect(result).toEqual([mockAnnotations[0], mockAnnotations[1]]);
        });
    });

    describe('annotations for amino acid mutations', () => {
        const mockAnnotations: MutationAnnotations = [
            {
                name: 'Annotation 1',
                description: 'Description 1',
                symbol: 'A1',
                aminoAcidMutations: ['B456', 'B789'],
            },
        ];

        it('should return the correct mutation annotation for a given mutations', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('B456')!, 'amino acid');

            expect(result).toEqual([mockAnnotations[0]]);
        });
    });

    describe('annotations for nucleotide positions', () => {
        const mockAnnotations: MutationAnnotations = [
            {
                name: 'Annotation 1',
                description: 'Description 1',
                symbol: 'A1',
                nucleotideMutations: ['A321T', 'A432T'],
                nucleotidePositions: ['321', '543'],
            },
            {
                name: 'Annotation 2',
                description: 'Description 2',
                symbol: 'A2',
                nucleotidePositions: ['432'],
            },
        ];

        it('should return the correct mutation annotation covered by position only', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('A543T')!, 'nucleotide');
            expect(result).toEqual([mockAnnotations[0]]);
        });

        it('should return the correct mutation annotation covered both by position and mutation', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('A321T')!, 'nucleotide');
            expect(result).toEqual([mockAnnotations[0]]);
        });

        it('should return both annotations if one matches the mutations and the other the position', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('A432T')!, 'nucleotide');
            expect(result).toEqual([mockAnnotations[1], mockAnnotations[0]]);
        });
    });

    describe('annotations for amino acid positions', () => {
        const mockAnnotations: MutationAnnotations = [
            {
                name: 'Annotation 1',
                description: 'Description 1',
                symbol: 'A1',
                aminoAcidMutations: ['Gene:B321C', 'Gene:B432G'],
                aminoAcidPositions: ['Gene:432', 'Gene:543'],
            },
        ];

        it('should return the correct mutation annotation covered both by position and mutation', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('Gene:B432G')!, 'amino acid');
            expect(result).toEqual([mockAnnotations[0]]);
        });

        it('should return the correct mutation annotation covered both by position only', () => {
            const result = renderAnnotationsHook(mockAnnotations)(SubstitutionClass.parse('Gene:B543G')!, 'amino acid');
            expect(result).toEqual([mockAnnotations[0]]);
        });

        it('should return no mutation annotation for an amino acid position of wrong gene', () => {
            const result = renderAnnotationsHook(mockAnnotations)(
                SubstitutionClass.parse('NotTheGene:B543G')!,
                'amino acid',
            );
            expect(result).toBeUndefined();
        });
    });
});
