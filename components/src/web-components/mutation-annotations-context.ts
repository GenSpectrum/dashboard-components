import { createContext } from '@lit/context';
import z from 'zod';

const mutationAnnotationSchema = z.object({
    name: z.string(),
    description: z.string(),
    symbol: z.string(),
    nucleotideMutations: z.array(z.string()),
    aminoAcidMutations: z.array(z.string()),
});
export type MutationAnnotation = z.infer<typeof mutationAnnotationSchema>;

export const mutationAnnotationsSchema = z.array(mutationAnnotationSchema);
export type MutationAnnotations = z.infer<typeof mutationAnnotationsSchema>;

export const mutationAnnotationsContext = createContext<MutationAnnotations>(Symbol('mutation-annotations-context'));
