export type LapisFilter = Record<string, any>;

export type NamedLapisFilter = LapisFilter & { displayName: string };

export type TemporalGranularity = 'day' | 'month' | 'year';

export type SequenceType = 'nucleotide' | 'amino acid';
