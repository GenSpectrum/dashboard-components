import { createContext } from '@lit/context';
import z from 'zod';

const annotations = z.array(z.string());

const mutationAnnotationSchema = z.object({
    name: z.string(),
    description: z.string(),
    symbol: z.string(),
    nucleotideMutations: annotations.optional(),
    nucleotidePositions: annotations.optional(),
    aminoAcidMutations: annotations.optional(),
    aminoAcidPositions: annotations.optional(),
});
export type MutationAnnotation = z.infer<typeof mutationAnnotationSchema>;

export const mutationAnnotationsSchema = z.array(mutationAnnotationSchema);
export type MutationAnnotations = z.infer<typeof mutationAnnotationsSchema>;

export const mutationAnnotationsContext = createContext<MutationAnnotations>(Symbol('mutation-annotations-context'));
