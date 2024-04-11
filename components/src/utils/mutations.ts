import { type SequenceType } from '../types';

export interface Mutation {
    readonly segment: string | undefined;
    readonly position: number;
    readonly code: string;
}

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

    toString() {
        return this.code;
    }

    static parse(mutationStr: string): Substitution {
        const parts = mutationStr.split(':');
        if (parts.length === 1) {
            return new Substitution(
                undefined,
                parts[0].charAt(0),
                parts[0].charAt(parts[0].length - 1),
                parseInt(parts[0].slice(1, -1), 10),
            );
        } else if (parts.length === 2) {
            return new Substitution(
                parts[0],
                parts[1].charAt(0),
                parts[1].charAt(parts[1].length - 1),
                parseInt(parts[1].slice(1, -1), 10),
            );
        }
        throw Error(`Invalid substitution: ${mutationStr}`);
    }
}

export class Deletion implements Mutation {
    readonly code;

    constructor(
        readonly segment: string | undefined,
        readonly valueAtReference: string,
        readonly position: number,
    ) {
        this.code = `${this.segment ? `${this.segment}:` : ''}${this.valueAtReference}${this.position}-`;
    }

    toString() {
        return this.code;
    }

    static parse(mutationStr: string): Deletion {
        const substitution = Substitution.parse(mutationStr);
        if (substitution.substitutionValue !== '-') {
            throw Error(`Invalid deletion: ${mutationStr}`);
        }
        return new Deletion(substitution.segment, substitution.valueAtReference, substitution.position);
    }
}

export class Insertion implements Mutation {
    readonly code;

    constructor(
        readonly segment: string | undefined,
        readonly position: number,
        readonly insertedSymbols: string,
    ) {
        this.code = `ins_${this.segment ? `${this.segment}:` : ''}${this.position}:${this.insertedSymbols}`;
    }

    toString() {
        return this.code;
    }

    static parse(mutationStr: string): Insertion {
        const insertionStr = mutationStr.slice(4);
        const parts = insertionStr.split(':');
        if (parts.length === 2) {
            return new Insertion(undefined, parseInt(parts[0], 10), parts[1]);
        } else if (parts.length === 3) {
            return new Insertion(parts[0], parseInt(parts[1], 10), parts[2]);
        }
        throw Error(`Invalid insertion: ${mutationStr}`);
    }
}

export const segmentName: { [P in SequenceType]: string } = {
    nucleotide: 'Segment',
    'amino acid': 'Gene',
};

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
