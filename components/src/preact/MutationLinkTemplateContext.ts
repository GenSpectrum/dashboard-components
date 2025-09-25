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
        let link = undefined;

        switch (sequenceType) {
            case 'nucleotide': {
                if (linkTemplate.nucleotideMutation !== undefined) {
                    link = linkTemplate.nucleotideMutation.replace('{{mutation}}', encodeURIComponent(mutation.code));
                }
                break;
            }

            case 'amino acid': {
                if (linkTemplate.aminoAcidMutation !== undefined) {
                    link = linkTemplate.aminoAcidMutation.replace('{{mutation}}', encodeURIComponent(mutation.code));
                }
                break;
            }
        }

        return link;
    };
}
