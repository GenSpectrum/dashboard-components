export type Substitution = {
    ref: string;
    alt: string;
    position: number;
};

export type Deletion = {
    ref: string;
    position: number;
};

export type Insertion = {
    position: number;
    value: string;
};

export type Mutation = Substitution | Deletion | Insertion;

export type MutationSet = {
    substitutions: { substitution: Substitution; count: number; proportion: number }[];
    deletions: { deletion: Deletion; count: number; proportion: number }[];
    insertions: { insertion: Insertion; count: number }[];
};

export type Segmented<T> = {
    segment: string;
} & T;

export type MaybeSegmented<T> = {
    segment?: string;
} & T;

export function parseMutation(
    mutationStr: string,
):
    | { value: MaybeSegmented<Substitution>; type: 'substitution' }
    | { value: MaybeSegmented<Deletion>; type: 'deletion' }
    | { value: MaybeSegmented<Insertion>; type: 'insertion' } {
    if (mutationStr.startsWith('ins_')) {
        return { value: parseInsertion(mutationStr), type: 'insertion' };
    }
    if (mutationStr.endsWith('-')) {
        return { value: parseDeletion(mutationStr), type: 'deletion' };
    }
    return { value: parseSubstitution(mutationStr), type: 'substitution' };
}

function parseSubstitution(mutationStr: string): MaybeSegmented<Substitution> {
    const parts = mutationStr.split(':');
    if (parts.length === 1) {
        return {
            segment: undefined,
            ref: parts[0].charAt(0),
            alt: parts[0].charAt(parts[0].length - 1),
            position: parseInt(parts[0].slice(1, -1)),
        };
    } else if (parts.length === 2) {
        return {
            segment: parts[0],
            ref: parts[1].charAt(0),
            alt: parts[1].charAt(parts[0].length - 1),
            position: parseInt(parts[1].slice(1, -1)),
        };
    }
    throw Error(`Invalid substitution: ${mutationStr}`);
}

function parseDeletion(mutationStr: string): MaybeSegmented<Deletion> {
    const substitution = parseSubstitution(mutationStr);
    if (substitution.alt !== '-') {
        throw Error(`Invalid deletion: ${mutationStr}`);
    }
    return {
        segment: substitution.segment,
        ref: substitution.ref,
        position: substitution.position,
    };
}

function parseInsertion(mutationStr: string): MaybeSegmented<Insertion> {
    const insertionStr = mutationStr.slice(4);
    const parts = insertionStr.split(':');
    if (parts.length === 2) {
        return {
            segment: undefined,
            position: parseInt(parts[0]),
            value: parts[1],
        };
    } else if (parts.length === 3) {
        return {
            segment: parts[0],
            position: parseInt(parts[1]),
            value: parts[2],
        };
    }
    throw Error(`Invalid insertion: ${mutationStr}`);
}
