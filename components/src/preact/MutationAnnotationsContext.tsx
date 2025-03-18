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
import { type Mutation } from '../utils/mutations';

type MutationAnnotationPerSequenceType = {
    mutation: Map<string, MutationAnnotations>;
    position: Map<string, MutationAnnotations>;
};

const MutationAnnotationsContext = createContext<Record<SequenceType, MutationAnnotationPerSequenceType>>({
    nucleotide: {
        mutation: new Map(),
        position: new Map(),
    },
    'amino acid': {
        mutation: new Map(),
        position: new Map(),
    },
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
        const nucleotidePositions = new Map<string, MutationAnnotations>();
        const aminoAcidMap = new Map<string, MutationAnnotations>();
        const aminoAcidPositions = new Map<string, MutationAnnotations>();

        value.forEach((annotation) => {
            new Set(annotation.nucleotideMutations).forEach((code) => {
                addAnnotationToMap(nucleotideMap, code, annotation);
            });
            new Set(annotation.aminoAcidMutations).forEach((code) => {
                addAnnotationToMap(aminoAcidMap, code, annotation);
            });
            new Set(annotation.nucleotidePositions).forEach((position) => {
                addAnnotationToMap(nucleotidePositions, position, annotation);
            });
            new Set(annotation.aminoAcidPositions).forEach((position) => {
                addAnnotationToMap(aminoAcidPositions, position, annotation);
            });
        });

        return {
            success: true as const,
            value: {
                nucleotide: { mutation: nucleotideMap, position: nucleotidePositions },
                'amino acid': { mutation: aminoAcidMap, position: aminoAcidPositions },
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

    return (mutation: Mutation, sequenceType: SequenceType) => {
        const position =
            mutation.segment === undefined
                ? `${mutation.position}`
                : `${mutation.segment.toUpperCase()}:${mutation.position}`;

        const possiblePositionAnnotations = mutationAnnotations[sequenceType].position.get(position);
        const possibleExactAnnotations = mutationAnnotations[sequenceType].mutation.get(mutation.code.toUpperCase());

        const annotations =
            possiblePositionAnnotations && possibleExactAnnotations
                ? [...possiblePositionAnnotations, ...possibleExactAnnotations]
                : (possiblePositionAnnotations ?? possibleExactAnnotations);

        const uniqueNames = new Set<string>();

        return annotations?.filter((item) => {
            if (uniqueNames.has(item.name)) {
                return false;
            }
            uniqueNames.add(item.name);
            return true;
        });
    };
}
