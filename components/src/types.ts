import z from 'zod';

import {
    type Deletion,
    type DeletionClass,
    type Insertion,
    type InsertionClass,
    type Substitution,
    type SubstitutionClass,
} from './utils/mutations';

export const mutationsFilterSchema = z.object({
    nucleotideMutations: z.array(z.string()),
    aminoAcidMutations: z.array(z.string()),
    nucleotideInsertions: z.array(z.string()),
    aminoAcidInsertions: z.array(z.string()),
});
export type MutationsFilter = z.infer<typeof mutationsFilterSchema>;

export const lapisFilterSchema = z
    .record(z.union([z.string(), z.array(z.string()), z.number(), z.null(), z.boolean(), z.undefined()]))
    .and(mutationsFilterSchema.partial());
export type LapisFilter = z.infer<typeof lapisFilterSchema>;

export const namedLapisFilterSchema = z.object({
    lapisFilter: lapisFilterSchema,
    displayName: z.string(),
});
export type NamedLapisFilter = z.infer<typeof namedLapisFilterSchema>;

export const lapisLocationFilterSchema = z.record(z.union([z.string(), z.undefined()]));
export type LapisLocationFilter = z.infer<typeof lapisLocationFilterSchema>;

export const temporalGranularitySchema = z.union([
    z.literal('day'),
    z.literal('week'),
    z.literal('month'),
    z.literal('year'),
]);
export type TemporalGranularity = z.infer<typeof temporalGranularitySchema>;

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
    grid: 'grid',
    insertions: 'insertions',
    bar: 'bar',
    line: 'line',
    bubble: 'bubble',
    map: 'map',
} as const;
