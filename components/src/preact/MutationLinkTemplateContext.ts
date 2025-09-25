import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import type { SequenceType } from '../types';
import type { Deletion, Substitution } from '../utils/mutations';

type MutationLinkTemplate = {
    nucleotideMutation?: string;
    aminoAcidMutation?: string;
};

export const MutationLinkTemplateContext = createContext<MutationLinkTemplate>({
    nucleotideMutation: undefined,
    aminoAcidMutation: undefined,
});

export function useMutationLinkProvider() {
    const linkTemplate = useContext(MutationLinkTemplateContext);

    return (mutation: Substitution | Deletion, sequenceType: SequenceType) => {
        switch (sequenceType) {
            case 'nucleotide': {
                if (linkTemplate.nucleotideMutation !== undefined) {
                    return linkTemplate.nucleotideMutation.replace('{{mutation}}', encodeURIComponent(mutation.code));
                }
                return undefined;
            }

            case 'amino acid': {
                if (linkTemplate.aminoAcidMutation !== undefined) {
                    return linkTemplate.aminoAcidMutation.replace('{{mutation}}', encodeURIComponent(mutation.code));
                }
                return undefined;
            }
        }
    };
}
