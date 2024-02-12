export type LapisFilter = Record<string, string | number | null | boolean>;

export type NamedLapisFilter = LapisFilter & { displayName: string };

export type TemporalGranularity = 'day' | 'week' | 'month' | 'year';

export type SequenceType = 'nucleotide' | 'amino acid';
