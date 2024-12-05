import z from 'zod';

import {
    type Deletion,
    type DeletionClass,
    type Insertion,
    type InsertionClass,
    type Substitution,
    type SubstitutionClass,
} from './utils/mutations';

export const lapisFilterSchema = z.record(z.union([z.string(), z.number(), z.null(), z.boolean()]));
export type LapisFilter = z.infer<typeof lapisFilterSchema>;

export const namedLapisFilterSchema = z.object({
    lapisFilter: lapisFilterSchema,
    displayName: z.string(),
});
export type NamedLapisFilter = z.infer<typeof namedLapisFilterSchema>;

export type TemporalGranularity = 'day' | 'week' | 'month' | 'year';

export const sequenceTypeSchema = z.union([z.literal('nucleotide'), z.literal('amino acid')]);
export type SequenceType = z.infer<typeof sequenceTypeSchema>;

export type SubstitutionOrDeletion = 'substitution' | 'deletion';

export type MutationType = SubstitutionOrDeletion | 'insertion';

export type SubstitutionEntry<T extends Substitution = SubstitutionClass> = {
    type: 'substitution';
    mutation: T;
    count: number;
    proportion: number;
};

export type DeletionEntry<T extends Deletion = DeletionClass> = {
    type: 'deletion';
    mutation: T;
    count: number;
    proportion: number;
};

export type InsertionEntry<T extends Insertion = InsertionClass> = { type: 'insertion'; mutation: T; count: number };

export type SubstitutionOrDeletionEntry<
    S extends Substitution = SubstitutionClass,
    D extends Deletion = DeletionClass,
> = SubstitutionEntry<S> | DeletionEntry<D>;

export type MutationEntry = SubstitutionEntry | DeletionEntry | InsertionEntry;

export const views = {
    table: 'table',
    venn: 'venn',
} as const;

export const mutationComparisonViewSchema = z.union([z.literal(views.table), z.literal(views.venn)]);
export type MutationComparisonView = z.infer<typeof mutationComparisonViewSchema>;
