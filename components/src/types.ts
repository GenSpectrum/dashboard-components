import {
    type Deletion,
    type DeletionClass,
    type Insertion,
    type InsertionClass,
    type Substitution,
    type SubstitutionClass,
} from './utils/mutations';

export type LapisFilter = Record<string, string | number | null | boolean>;

export type NamedLapisFilter = {
    lapisFilter: LapisFilter;
    displayName: string;
};

export type TemporalGranularity = 'day' | 'week' | 'month' | 'year';

export type SequenceType = 'nucleotide' | 'amino acid';

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
