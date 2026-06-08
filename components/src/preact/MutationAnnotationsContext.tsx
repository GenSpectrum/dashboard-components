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

export type ResolvedMutationAnnotation = {
    annotation: MutationAnnotation;
    name: string;
    description: string;
};

type AnnotationLookup = {
    mutation: Map<string, ResolvedMutationAnnotation[]>;
    position: Map<string, ResolvedMutationAnnotation[]>;
};

type MutationAnnotationsContextValue = Record<SequenceType, AnnotationLookup> & {
    rawAnnotations: MutationAnnotations;
};

const MutationAnnotationsContext = createContext<MutationAnnotationsContextValue>({
    rawAnnotations: [],
    nucleotide: {
        mutation: new Map(),
        position: new Map(),
    },
    'amino acid': {
        mutation: new Map(),
        position: new Map(),
    },
});

/**
 * Validates and provides mutation annotations to all descendant components.
 * Accepts the raw MutationAnnotations config, builds the internal lookup index, and stores it in context.
 * Renders an error message if the provided annotations fail schema validation.
 */
export const MutationAnnotationsContextProvider: FunctionalComponent<
    Omit<ComponentProps<typeof MutationAnnotationsContext.Provider>, 'value'> & { value: MutationAnnotations }
> = ({ value, children }) => {
    const parseResult = useMemo(() => mutationAnnotationsSchema.safeParse(value), [value]);
    const contextValue = useMemo(
        () =>
            parseResult.success
                ? { success: true as const, value: buildAnnotationIndex(parseResult.data) }
                : { success: false as const, error: parseResult.error },
        [parseResult],
    );

    if (!contextValue.success) {
        return (
            <ResizeContainer size={{ width: '100%' }}>
                <ErrorDisplay error={contextValue.error} layout='vertical' />
            </ResizeContainer>
        );
    }

    return (
        <MutationAnnotationsContext.Provider value={contextValue.value}>{children}</MutationAnnotationsContext.Provider>
    );
};

/**
 * Indexes a flat list of MutationAnnotations into fast lookup maps, resolving per-entry name/description overrides
 * eagerly. Called once (memoized) when the annotations config is set on the provider.
 *
 * Returns two maps per sequence type — one keyed by exact mutation code, one by position string — each mapping to
 * the list of ResolvedMutationAnnotations that apply to that key.
 */
export function buildAnnotationIndex(value: MutationAnnotations): MutationAnnotationsContextValue {
    const nucleotideMutationMap = new Map<string, ResolvedMutationAnnotation[]>();
    const nucleotidePositionMap = new Map<string, ResolvedMutationAnnotation[]>();
    const aminoAcidMutationMap = new Map<string, ResolvedMutationAnnotation[]>();
    const aminoAcidPositionMap = new Map<string, ResolvedMutationAnnotation[]>();

    value.forEach((annotation) => {
        annotation.nucleotideMutations?.forEach((entry) => {
            addToMap(
                nucleotideMutationMap,
                typeof entry === 'string' ? entry : entry.mutation,
                resolve(annotation, entry),
            );
        });
        annotation.aminoAcidMutations?.forEach((entry) => {
            addToMap(
                aminoAcidMutationMap,
                typeof entry === 'string' ? entry : entry.mutation,
                resolve(annotation, entry),
            );
        });
        annotation.nucleotidePositions?.forEach((entry) => {
            addToMap(
                nucleotidePositionMap,
                typeof entry === 'string' ? entry : entry.position,
                resolve(annotation, entry),
            );
        });
        annotation.aminoAcidPositions?.forEach((entry) => {
            addToMap(
                aminoAcidPositionMap,
                typeof entry === 'string' ? entry : entry.position,
                resolve(annotation, entry),
            );
        });
    });

    return {
        rawAnnotations: value,
        nucleotide: { mutation: nucleotideMutationMap, position: nucleotidePositionMap },
        'amino acid': { mutation: aminoAcidMutationMap, position: aminoAcidPositionMap },
    };
}

function resolve(
    annotation: MutationAnnotation,
    entry: string | { name?: string; description?: string },
): ResolvedMutationAnnotation {
    const overrides = typeof entry === 'object' ? entry : undefined;
    return {
        annotation,
        name: overrides?.name ?? annotation.name,
        description: overrides?.description ?? annotation.description,
    };
}

function addToMap(map: Map<string, ResolvedMutationAnnotation[]>, code: string, resolved: ResolvedMutationAnnotation) {
    const existing = map.get(code.toUpperCase()) ?? [];
    map.set(code.toUpperCase(), [...existing, resolved]);
}

export function useRawMutationAnnotations() {
    return useContext(MutationAnnotationsContext).rawAnnotations;
}

/**
 * Returns a lookup function `(mutation, sequenceType) => ResolvedMutationAnnotation[] | undefined` that, given a
 * specific mutation, returns all annotations that apply to it with name and description already resolved.
 * Returns undefined if no annotations match.
 */
export function useMutationAnnotationsProvider() {
    const mutationAnnotations = useContext(MutationAnnotationsContext);

    return useMemo(() => getMutationAnnotationsProvider(mutationAnnotations), [mutationAnnotations]);
}

export function getMutationAnnotationsProvider(mutationAnnotations: MutationAnnotationsContextValue) {
    return (mutation: Mutation, sequenceType: SequenceType) => {
        const position =
            mutation.segment === undefined
                ? `${mutation.position}`
                : `${mutation.segment.toUpperCase()}:${mutation.position}`;

        const exactMatches = mutationAnnotations[sequenceType].mutation.get(mutation.code.toUpperCase());
        const positionMatches = mutationAnnotations[sequenceType].position.get(position);

        const combined =
            exactMatches && positionMatches ? [...exactMatches, ...positionMatches] : (exactMatches ?? positionMatches);

        const seenNames = new Set<string>();

        return combined?.filter((resolved) => {
            if (seenNames.has(resolved.annotation.name)) {
                return false;
            }
            seenNames.add(resolved.annotation.name);
            return true;
        });
    };
}
