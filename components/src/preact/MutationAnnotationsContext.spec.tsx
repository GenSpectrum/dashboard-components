import { renderHook } from '@testing-library/preact';
import { type FunctionalComponent } from 'preact';
import { describe, expect, it } from 'vitest';

import { MutationAnnotationsContextProvider, useMutationAnnotationsProvider } from './MutationAnnotationsContext';
import { type MutationAnnotations } from '../web-components/mutation-annotations-context';

describe('useMutationAnnotation', () => {
    const mockAnnotations: MutationAnnotations = [
        {
            name: 'Annotation 1',
            description: 'Description 1',
            symbol: 'A1',
            nucleotideMutations: ['A123', 'A456'],
            aminoAcidMutations: ['B123'],
        },
        {
            name: 'Annotation 2',
            description: 'Description 2',
            symbol: 'A2',
            nucleotideMutations: ['A456', 'A789'],
            aminoAcidMutations: ['B456', 'B789'],
        },
    ];

    const wrapper: FunctionalComponent = ({ children }) => (
        <MutationAnnotationsContextProvider value={mockAnnotations}>{children}</MutationAnnotationsContextProvider>
    );

    function renderAnnotationsHook() {
        const { result } = renderHook(() => useMutationAnnotationsProvider(), { wrapper });
        return result.current;
    }

    it('should return the correct annotation for a given nucleotide mutation', () => {
        const result = renderAnnotationsHook()('A123', 'nucleotide');

        expect(result).toEqual([mockAnnotations[0]]);
    });

    it('should return the correct annotations if multiple contain a mutation', () => {
        const result = renderAnnotationsHook()('A456', 'nucleotide');

        expect(result).toEqual([mockAnnotations[0], mockAnnotations[1]]);
    });

    it('should return undefined for a non-existent mutation code', () => {
        const result = renderAnnotationsHook()('NON_EXISTENT', 'nucleotide');

        expect(result).toBeUndefined();
    });

    it('should return the correct mutation annotation for amino acid mutations', () => {
        const result = renderAnnotationsHook()('B456', 'amino acid');

        expect(result).toEqual([mockAnnotations[1]]);
    });
});
