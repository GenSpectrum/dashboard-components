import { createContext } from '@lit/context';
import z from 'zod';

export const mutationLinkTemplateSchema = z.object({
    nucleotideMutation: z.string().optional(),
    aminoAcidMutation: z.string().optional(),
});

export type MutationLinkTemplate = z.infer<typeof mutationLinkTemplateSchema>;

export const mutationLinkTemplateContext = createContext<MutationLinkTemplate>(
    Symbol('mutation-link-template-context'),
);
