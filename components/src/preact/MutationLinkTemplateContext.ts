import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Deletion, Substitution } from '../utils/mutations';
import { SequenceType } from '../types';

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
                if (linkTemplate.nucleotideMutation !== null) {
                    link = linkTemplate.nucleotideMutation?.replace('{{mutation}}', encodeURIComponent(mutation.code));
                }
                break;
            }

            case 'amino acid': {
                if (linkTemplate.aminoAcidMutation !== null) {
                    link = linkTemplate.aminoAcidMutation?.replace('{{mutation}}', encodeURIComponent(mutation.code));
                }
                break;
            }
        }

        return link;
    };
}
