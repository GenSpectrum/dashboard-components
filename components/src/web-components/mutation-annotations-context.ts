import { createContext } from '@lit/context';
import z from 'zod';

const mutationEntrySchema = z.union([
    z.string(),
    z.object({ mutation: z.string(), name: z.string().optional(), description: z.string().optional() }),
]);

const positionEntrySchema = z.union([
    z.string(),
    z.object({ position: z.string(), name: z.string().optional(), description: z.string().optional() }),
]);

const mutationAnnotationSchema = z.object({
    name: z.string(),
    description: z.string(),
    symbol: z.string(),
    nucleotideMutations: z.array(mutationEntrySchema).optional(),
    nucleotidePositions: z.array(positionEntrySchema).optional(),
    aminoAcidMutations: z.array(mutationEntrySchema).optional(),
    aminoAcidPositions: z.array(positionEntrySchema).optional(),
});
export type MutationAnnotation = z.infer<typeof mutationAnnotationSchema>;

export const mutationAnnotationsSchema = z.array(mutationAnnotationSchema, {
    errorMap: () => ({ message: 'invalid mutation annotations' }),
});
export type MutationAnnotations = z.infer<typeof mutationAnnotationsSchema>;

export const mutationAnnotationsContext = createContext<MutationAnnotations>(Symbol('mutation-annotations-context'));
