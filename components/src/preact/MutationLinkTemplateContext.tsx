import { createContext, type Provider } from 'preact';
import { useContext, useMemo } from 'preact/hooks';

import type { SequenceType } from '../types';
import type { Deletion, Substitution } from '../utils/mutations';
import { mutationLinkTemplateSchema } from '../web-components/mutation-link-template-context';
import { ErrorDisplay } from './components/error-display';
import { ResizeContainer } from './components/resize-container';

type MutationLinkTemplate = {
    nucleotideMutation?: string;
    aminoAcidMutation?: string;
};

const MutationLinkTemplateContext = createContext<MutationLinkTemplate>({
    nucleotideMutation: undefined,
    aminoAcidMutation: undefined,
});

export const MutationLinkTemplateContextProvider: Provider<MutationLinkTemplate> = ({ value, children }) => {
    const parseResult = useMemo(() => mutationLinkTemplateSchema.safeParse(value), [value]);

    if (!parseResult.success) {
        return (
            <ResizeContainer size={{ width: '100%' }}>
                <ErrorDisplay error={parseResult.error} layout='vertical' />
            </ResizeContainer>
        );
    }

    return (
        <MutationLinkTemplateContext.Provider value={parseResult.data}>{children}</MutationLinkTemplateContext.Provider>
    );
};

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
