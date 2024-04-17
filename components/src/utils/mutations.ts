import { type SequenceType } from '../types';

export interface Mutation {
    readonly segment: string | undefined;
    readonly position: number;
    readonly code: string;

    equals(other: Mutation): boolean;

    toString(): string;
}

export const substitutionRegex =
    /((?<segment>[A-Za-z0-9]+):)?(?<valueAtReference>[A-Za-z])(?<position>\d+)(?<substitutionValue>[A-Za-z]|\*)/;

export class Substitution implements Mutation {
    readonly code;

    constructor(
        readonly segment: string | undefined,
        readonly valueAtReference: string,
        readonly substitutionValue: string,
        readonly position: number,
    ) {
        this.code = `${this.segment ? `${this.segment}:` : ''}${this.valueAtReference}${this.position}${this.substitutionValue}`;
    }

    equals(other: Mutation): boolean {
        if (!(other instanceof Substitution)) {
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

    static parse(mutationStr: string): Substitution | null {
        const match = mutationStr.match(substitutionRegex);
        if (match === null || match.groups === undefined) {
            return null;
        }
        return new Substitution(
            match.groups.segment,
            match.groups.valueAtReference,
            match.groups.substitutionValue,
            parseInt(match.groups.position, 10),
        );
    }
}

export const deletionRegex = /((?<segment>[A-Za-z0-9]+):)?(?<valueAtReference>[A-Za-z])(?<position>\d+)(-)/;

export class Deletion implements Mutation {
    readonly code;

    constructor(
        readonly segment: string | undefined,
        readonly valueAtReference: string,
        readonly position: number,
    ) {
        this.code = `${this.segment ? `${this.segment}:` : ''}${this.valueAtReference}${this.position}-`;
    }

    equals(other: Mutation): boolean {
        if (!(other instanceof Deletion)) {
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

    static parse(mutationStr: string): Deletion | null {
        const match = mutationStr.match(deletionRegex);
        if (match === null || match.groups === undefined) {
            return null;
        }

        return new Deletion(match.groups.segment, match.groups.valueAtReference, parseInt(match.groups.position, 10));
    }
}

export const insertionRegexp = /^ins_((?<segment>[A-Za-z0-9]+):)?(<position>\d+):(<insertedSymbol>[A-Za-z]+|\*)/i;

export class Insertion implements Mutation {
    readonly code;

    constructor(
        readonly segment: string | undefined,
        readonly position: number,
        readonly insertedSymbols: string,
    ) {
        this.code = `ins_${this.segment ? `${this.segment}:` : ''}${this.position}:${this.insertedSymbols}`;
    }

    equals(other: Mutation): boolean {
        if (!(other instanceof Insertion)) {
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

    static parse(mutationStr: string): Insertion | null {
        const match = mutationStr.match(insertionRegexp);
        if (match === null || match.groups === undefined) {
            return null;
        }

        return new Insertion(match.groups.segment, parseInt(match.groups.position, 10), match.groups.insertedSymbols);
    }
}

export const bases: { [P in SequenceType]: string[] } = {
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
