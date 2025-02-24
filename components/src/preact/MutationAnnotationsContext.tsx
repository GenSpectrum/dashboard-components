import { type ComponentProps, createContext, type FunctionalComponent } from 'preact';
import { useContext, useMemo } from 'preact/hooks';

import { type SequenceType } from '../types';
import {
    type MutationAnnotation,
    type MutationAnnotations,
    mutationAnnotationsSchema,
} from '../web-components/mutation-annotations-context';
import { ErrorDisplay } from './components/error-display';
import { ResizeContainer } from './components/resize-container';

const MutationAnnotationsContext = createContext<Record<SequenceType, Map<string, MutationAnnotations>>>({
    nucleotide: new Map(),
    'amino acid': new Map(),
});

export const MutationAnnotationsContextProvider: FunctionalComponent<
    Omit<ComponentProps<typeof MutationAnnotationsContext.Provider>, 'value'> & { value: MutationAnnotations }
> = ({ value, children }) => {
    const parseResult = useMemo(() => {
        const parseResult = mutationAnnotationsSchema.safeParse(value);

        if (!parseResult.success) {
            return parseResult;
        }

        const nucleotideMap = new Map<string, MutationAnnotations>();
        const aminoAcidMap = new Map<string, MutationAnnotations>();

        value.forEach((annotation) => {
            new Set(annotation.nucleotideMutations).forEach((code) => {
                addAnnotationToMap(nucleotideMap, code, annotation);
            });
            new Set(annotation.aminoAcidMutations).forEach((code) => {
                addAnnotationToMap(aminoAcidMap, code, annotation);
            });
        });

        return {
            success: true as const,
            value: {
                nucleotide: nucleotideMap,
                'amino acid': aminoAcidMap,
            },
        };
    }, [value]);

    if (!parseResult.success) {
        return (
            <ResizeContainer size={{ width: '100%' }}>
                <ErrorDisplay error={parseResult.error} layout='vertical' />
            </ResizeContainer>
        );
    }

    return (
        <MutationAnnotationsContext.Provider value={parseResult.value}>{children}</MutationAnnotationsContext.Provider>
    );
};

function addAnnotationToMap(map: Map<string, MutationAnnotations>, code: string, annotation: MutationAnnotation) {
    const oldAnnotations = map.get(code.toUpperCase()) ?? [];
    map.set(code.toUpperCase(), [...oldAnnotations, annotation]);
}

export function useMutationAnnotationsProvider() {
    const mutationAnnotations = useContext(MutationAnnotationsContext);

    return (mutationCode: string, sequenceType: SequenceType) =>
        mutationAnnotations[sequenceType].get(mutationCode.toUpperCase());
}
