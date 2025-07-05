import z from 'zod';

const lineage = z.object({
    parents: z.array(z.string()).optional(),
    aliases: z.array(z.string()).default([]),
});

// LAPIS' response does not include `aliases` as a key if no aliases are defined
const lineageResponse = lineage.extend({
    aliases: lineage.shape.aliases.optional(),
});

export const lineageDefinitionSchema = z.record(lineage);
export const lineageDefinitionResponseSchema = z.record(lineageResponse);
export type LineageDefinitionResponse = z.infer<typeof lineageDefinitionResponseSchema>;
