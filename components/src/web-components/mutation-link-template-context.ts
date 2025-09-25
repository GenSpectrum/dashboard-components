import { createContext } from '@lit/context';
import z from 'zod';

// TODO - use this to validate somewhere
const _mutationLinkTemplateSchema = z.object({
    nucleotideMutation: z.string().optional(),
    aminoAcidMutation: z.string().optional(),
});

export type MutationLinkTemplate = z.infer<typeof _mutationLinkTemplateSchema>;

export const mutationLinkTemplateContext = createContext<MutationLinkTemplate>(
    Symbol('mutation-link-template-context'),
);
