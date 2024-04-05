import { type Deletion, type Insertion, type Substitution } from './utils/mutations';

export type LapisFilter = Record<string, string | number | null | boolean>;

export type NamedLapisFilter = LapisFilter & { displayName: string };

export type TemporalGranularity = 'day' | 'week' | 'month' | 'year';

export type SequenceType = 'nucleotide' | 'amino acid';

export type SubstitutionOrDeletion = 'substitution' | 'deletion';

export type MutationType = SubstitutionOrDeletion | 'insertion';

export type SubstitutionEntry = { type: 'substitution'; mutation: Substitution; count: number; proportion: number };

export type DeletionEntry = { type: 'deletion'; mutation: Deletion; count: number; proportion: number };

export type InsertionEntry = { type: 'insertion'; mutation: Insertion; count: number };

export type SubstitutionOrDeletionEntry = SubstitutionEntry | DeletionEntry;

export type MutationEntry = SubstitutionEntry | DeletionEntry | InsertionEntry;
