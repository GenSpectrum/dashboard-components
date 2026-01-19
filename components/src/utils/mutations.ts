import { type SubstitutionOrDeletionOrInsertion, type SequenceType } from '../types';

export interface Mutation {
    readonly position: number;
    readonly code: string;
    readonly type: SubstitutionOrDeletionOrInsertion;
    readonly segment?: string;
}

export interface MutationClass extends Mutation {
    equals(other: MutationClass): boolean;

    toString(): string;
}

// Allowed IUPAC characters: https://www.bioinformatics.org/sms/iupac.html
const nucleotideChars = 'ACGTRYKMSWBDHVN';
const aminoAcidChars = 'ACDEFGHIKLMNPQRSTVWY';
// Ambiguous IUPAC symbols (excluded from standard parsing but can be enabled via parseAmbiguousSymbols flag)
const ambiguousNucleotideChars = 'X'; // Unknown nucleotide
const ambiguousAminoAcidChars = 'X'; // Unknown amino acid

function segmentPart(isOptional: boolean) {
    const segmentPart = `(?<segment>[A-Z0-9_-]+):`;
    if (isOptional) {
        return `(${segmentPart})?`;
    }
    return segmentPart;
}

function buildSubstitutionRegex(
    type: 'nucleotide' | 'aminoAcid',
    segmentPartIsOptional: boolean,
    parseAmbiguousSymbols: boolean = false,
) {
    const baseChars = type === 'nucleotide' ? nucleotideChars : aminoAcidChars;
    const ambiguousChars = type === 'nucleotide' ? ambiguousNucleotideChars : ambiguousAminoAcidChars;
    const chars = parseAmbiguousSymbols ? baseChars + ambiguousChars : baseChars;

    return new RegExp(
        `^${segmentPart(segmentPartIsOptional)}` +
            `(?<valueAtReference>[${chars}*])?` +
            `(?<position>\\d+)` +
            `(?<substitutionValue>[${chars}.*])?$`,
        'i',
    );
}

const nucleotideSubstitutionRegex = buildSubstitutionRegex('nucleotide', true);
const aminoAcidSubstitutionRegex = buildSubstitutionRegex('aminoAcid', false);
const aminoAcidSubstitutionWithoutSegmentRegex = buildSubstitutionRegex('aminoAcid', true);
// Regexes that allow ambiguous symbols
const nucleotideSubstitutionRegexWithAmbiguous = buildSubstitutionRegex('nucleotide', true, true);
const aminoAcidSubstitutionRegexWithAmbiguous = buildSubstitutionRegex('aminoAcid', false, true);
const aminoAcidSubstitutionWithoutSegmentRegexWithAmbiguous = buildSubstitutionRegex('aminoAcid', true, true);

export interface Substitution extends Mutation {
    type: 'substitution';
    valueAtReference: string | undefined;
    substitutionValue: string | undefined;
}

export class SubstitutionClass implements MutationClass, Substitution {
    readonly code;
    readonly type = 'substitution';

    constructor(
        readonly segment: string | undefined,
        readonly valueAtReference: string | undefined,
        readonly substitutionValue: string | undefined,
        readonly position: number,
    ) {
        const segmentString = this.segment ? `${this.segment}:` : '';
        const valueAtReferenceString = this.valueAtReference ?? '';
        const substitutionValueString = this.substitutionValue ?? '';
        this.code = `${segmentString}${valueAtReferenceString}${this.position}${substitutionValueString}`;
    }

    equals(other: MutationClass): boolean {
        if (!(other instanceof SubstitutionClass)) {
            return false;
        }
        return (
            this.segment === other.segment &&
            this.valueAtReference === other.valueAtReference &&
            this.substitutionValue === other.substitutionValue &&
            this.position === other.position
        );
    }

    toString() {
        return this.code;
    }

    /**
     * Parse a mutation code string into a SubstitutionClass object
     * @param mutationStr - The mutation code to parse (e.g., "gene1:A234T")
     * @param segmentIsOptional - Whether segment prefix is optional
     * @param parseAmbiguousSymbols - Whether to allow ambiguous IUPAC symbols like 'X' (unknown)
     * @returns SubstitutionClass object or null if parsing fails
     */
    static parse(
        mutationStr: string,
        segmentIsOptional: boolean = false,
        parseAmbiguousSymbols: boolean = false,
    ): SubstitutionClass | null {
        const matchNucleotide = parseAmbiguousSymbols
            ? nucleotideSubstitutionRegexWithAmbiguous.exec(mutationStr)
            : nucleotideSubstitutionRegex.exec(mutationStr);
        const matchAminoAcid = parseAmbiguousSymbols
            ? aminoAcidSubstitutionRegexWithAmbiguous.exec(mutationStr)
            : aminoAcidSubstitutionRegex.exec(mutationStr);
        const matchAminAcidWithoutSegment = segmentIsOptional
            ? parseAmbiguousSymbols
                ? aminoAcidSubstitutionWithoutSegmentRegexWithAmbiguous.exec(mutationStr)
                : aminoAcidSubstitutionWithoutSegmentRegex.exec(mutationStr)
            : undefined;
        const match = matchNucleotide ?? matchAminoAcid ?? matchAminAcidWithoutSegment;
        if (match?.groups === undefined) {
            return null;
        }
        return new SubstitutionClass(
            match.groups.segment,
            match.groups.valueAtReference,
            match.groups.substitutionValue,
            parseInt(match.groups.position, 10),
        );
    }
}

function buildDeletionRegex(type: 'nucleotide' | 'aminoAcid', parseAmbiguousSymbols: boolean = false) {
    const baseChars = type === 'nucleotide' ? nucleotideChars : aminoAcidChars;
    const ambiguousChars = type === 'nucleotide' ? ambiguousNucleotideChars : ambiguousAminoAcidChars;
    const chars = parseAmbiguousSymbols ? baseChars + ambiguousChars : baseChars;

    return new RegExp(
        `^${segmentPart(type === 'nucleotide')}` + `(?<valueAtReference>[${chars}*])?` + `(?<position>\\d+)` + `(-)$`,
        'i',
    );
}

const nucleotideDeletionRegex = buildDeletionRegex('nucleotide');
const aminoAcidDeletionRegex = buildDeletionRegex('aminoAcid');
// Regexes that allow ambiguous symbols
const nucleotideDeletionRegexWithAmbiguous = buildDeletionRegex('nucleotide', true);
const aminoAcidDeletionRegexWithAmbiguous = buildDeletionRegex('aminoAcid', true);

export interface Deletion extends Mutation {
    type: 'deletion';
    valueAtReference: string | undefined;
}

export class DeletionClass implements MutationClass, Deletion {
    readonly code;
    readonly type = 'deletion';

    constructor(
        readonly segment: string | undefined,
        readonly valueAtReference: string | undefined,
        readonly position: number,
    ) {
        const segmentString = this.segment ? `${this.segment}:` : '';
        const valueAtReferenceString = this.valueAtReference ?? '';
        this.code = `${segmentString}${valueAtReferenceString}${this.position}-`;
    }

    equals(other: MutationClass): boolean {
        if (!(other instanceof DeletionClass)) {
            return false;
        }
        return (
            this.segment === other.segment &&
            this.valueAtReference === other.valueAtReference &&
            this.position === other.position
        );
    }

    toString() {
        return this.code;
    }

    /**
     * Parse a mutation code string into a DeletionClass object
     * @param mutationStr - The mutation code to parse (e.g., "gene1:A234-")
     * @param parseAmbiguousSymbols - Whether to allow ambiguous IUPAC symbols like 'X' (unknown)
     * @returns DeletionClass object or null if parsing fails
     */
    static parse(mutationStr: string, parseAmbiguousSymbols: boolean = false): DeletionClass | null {
        const matchNucleotide = parseAmbiguousSymbols
            ? nucleotideDeletionRegexWithAmbiguous.exec(mutationStr)
            : nucleotideDeletionRegex.exec(mutationStr);
        const matchAminoAcid = parseAmbiguousSymbols
            ? aminoAcidDeletionRegexWithAmbiguous.exec(mutationStr)
            : aminoAcidDeletionRegex.exec(mutationStr);
        const match = matchNucleotide ?? matchAminoAcid;
        if (match?.groups === undefined) {
            return null;
        }

        return new DeletionClass(
            match.groups.segment,
            match.groups.valueAtReference,
            parseInt(match.groups.position, 10),
        );
    }
}

function buildInsertionRegex(type: 'nucleotide' | 'aminoAcid', parseAmbiguousSymbols: boolean = false) {
    const baseChars = type === 'nucleotide' ? nucleotideChars : aminoAcidChars;
    const ambiguousChars = type === 'nucleotide' ? ambiguousNucleotideChars : ambiguousAminoAcidChars;
    const chars = parseAmbiguousSymbols ? baseChars + ambiguousChars : baseChars;

    const wildcardToken = `(?:\\.\\*)`;

    return new RegExp(
        `^ins_${segmentPart(type === 'nucleotide')}(?<position>\\d+):(?<insertedSymbols>(?:[${chars}?*]|${wildcardToken})+)$`,
        'i',
    );
}

const nucleotideInsertionRegex = buildInsertionRegex('nucleotide');
const aminoAcidInsertionRegex = buildInsertionRegex('aminoAcid');
// Regexes that allow ambiguous symbols
const nucleotideInsertionRegexWithAmbiguous = buildInsertionRegex('nucleotide', true);
const aminoAcidInsertionRegexWithAmbiguous = buildInsertionRegex('aminoAcid', true);

export interface Insertion extends Mutation {
    type: 'insertion';
    insertedSymbols: string;
}

export class InsertionClass implements MutationClass {
    readonly code;
    readonly type = 'insertion';

    constructor(
        readonly segment: string | undefined,
        readonly position: number,
        readonly insertedSymbols: string,
    ) {
        this.code = `ins_${this.segment ? `${this.segment}:` : ''}${this.position}:${this.insertedSymbols}`;
    }

    equals(other: MutationClass): boolean {
        if (!(other instanceof InsertionClass)) {
            return false;
        }
        return (
            this.segment === other.segment &&
            this.insertedSymbols === other.insertedSymbols &&
            this.position === other.position
        );
    }

    toString() {
        return this.code;
    }

    /**
     * Parse a mutation code string into an InsertionClass object
     * @param mutationStr - The mutation code to parse (e.g., "ins_gene1:234:ABC")
     * @param parseAmbiguousSymbols - Whether to allow ambiguous IUPAC symbols like 'X' (unknown)
     * @returns InsertionClass object or null if parsing fails
     */
    static parse(mutationStr: string, parseAmbiguousSymbols: boolean = false): InsertionClass | null {
        const matchNucleotide = parseAmbiguousSymbols
            ? nucleotideInsertionRegexWithAmbiguous.exec(mutationStr)
            : nucleotideInsertionRegex.exec(mutationStr);
        const matchAminoAcid = parseAmbiguousSymbols
            ? aminoAcidInsertionRegexWithAmbiguous.exec(mutationStr)
            : aminoAcidInsertionRegex.exec(mutationStr);
        const match = matchNucleotide ?? matchAminoAcid;
        if (match?.groups === undefined) {
            return null;
        }

        return new InsertionClass(
            match.groups.segment,
            parseInt(match.groups.position, 10),
            match.groups.insertedSymbols,
        );
    }
}

export function toMutation(
    mutationClass: SubstitutionClass | DeletionClass | InsertionClass,
): Substitution | Deletion | Insertion {
    if (mutationClass.type === 'insertion') {
        return {
            type: 'insertion' as const,
            code: mutationClass.code,
            segment: mutationClass.segment,
            position: mutationClass.position,
            insertedSymbols: mutationClass.insertedSymbols,
        };
    }
    return toSubstitutionOrDeletion(mutationClass);
}

export function toSubstitutionOrDeletion(mutation: SubstitutionClass | DeletionClass): Substitution | Deletion {
    switch (mutation.type) {
        case 'substitution':
            return {
                type: 'substitution' as const,
                code: mutation.code,
                segment: mutation.segment,
                position: mutation.position,
                valueAtReference: mutation.valueAtReference,
                substitutionValue: mutation.substitutionValue,
            };
        case 'deletion':
            return {
                type: 'deletion' as const,
                code: mutation.code,
                segment: mutation.segment,
                position: mutation.position,
                valueAtReference: mutation.valueAtReference,
            };
    }
}

export const bases: Record<SequenceType, string[]> = {
    nucleotide: ['A', 'C', 'G', 'T', '-'],
    'amino acid': [
        'I',
        'L',
        'V',
        'F',
        'M',
        'C',
        'A',
        'G',
        'P',
        'T',
        'S',
        'Y',
        'W',
        'Q',
        'N',
        'H',
        'E',
        'D',
        'K',
        'R',
        '-',
    ],
};
