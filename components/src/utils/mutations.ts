import { type MutationType, type SequenceType } from '../types';

export interface Mutation {
    readonly position: number;
    readonly code: string;
    readonly type: MutationType;
    readonly segment?: string;
}

export interface MutationClass extends Mutation {
    equals(other: MutationClass): boolean;

    toString(): string;
}

// Allowed IUPAC characters: https://www.bioinformatics.org/sms/iupac.html
const nucleotideChars = 'ACGTRYKMSWBDHVN';
const aminoAcidChars = 'ACDEFGHIKLMNPQRSTVWY';

function buildSubstitutionRegex(type: 'nucleotide' | 'aminoAcid') {
    const chars = type === 'nucleotide' ? nucleotideChars : aminoAcidChars;

    const segmentPart = type === 'aminoAcid' ? `(?<segment>[A-Z0-9_-]+):` : `((?<segment>[A-Z0-9_-]+)(?=:):)?`;

    return new RegExp(
        `^${segmentPart}` +
            `(?<valueAtReference>[${chars}*])?` +
            `(?<position>\\d+)` +
            `(?<substitutionValue>[${chars}.*])?$`,
        'i',
    );
}

const nucleotideRegex = buildSubstitutionRegex('nucleotide');
const aminoAcidRegex = buildSubstitutionRegex('aminoAcid');

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

    static parse(mutationStr: string): SubstitutionClass | null {
        const matchNucleotide = nucleotideRegex.exec(mutationStr);
        const matchAminoAcid = aminoAcidRegex.exec(mutationStr);
        const match = matchNucleotide ?? matchAminoAcid;
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

export const deletionRegex = /^((?<segment>[A-Z0-9_-]+)(?=:):)?(?<valueAtReference>[A-Z*])?(?<position>\d+)(-)$/i;

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

    static parse(mutationStr: string): DeletionClass | null {
        const match = deletionRegex.exec(mutationStr);
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

export const insertionRegexp =
    /^ins_((?<segment>[A-Z0-9_-]+)(?=:):)?(?<position>\d+):(?<insertedSymbols>(([A-Z?*]|(\.\*))+))$/i;

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

    static parse(mutationStr: string): InsertionClass | null {
        const match = insertionRegexp.exec(mutationStr);
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
