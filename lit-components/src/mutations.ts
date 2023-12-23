export class MutationCache {
    private substitutionCache = new Map<string, Substitution>();
    private deletionCache = new Map<string, Deletion>();
    private insertionCache = new Map<string, Insertion>();

    private constructor() {}

    getMutation(mutationStr: string): Mutation {
        if (mutationStr.startsWith('ins_')) {
            return this.getInsertion(mutationStr);
        }
        if (mutationStr.endsWith('-')) {
            return this.getDeletion(mutationStr);
        }
        return this.getSubstitution(mutationStr);
    }

    getSubstitution(mutationStr: string): Substitution {
        const key = mutationStr.toUpperCase();
        if (!this.substitutionCache.has(key)) {
            this.substitutionCache.set(key, Substitution.parse(mutationStr));
        }
        return this.substitutionCache.get(key)!;
    }

    getDeletion(mutationStr: string): Deletion {
        const key = mutationStr.toUpperCase();
        if (!this.deletionCache.has(key)) {
            this.deletionCache.set(key, Deletion.parse(mutationStr));
        }
        return this.deletionCache.get(key)!;
    }

    getInsertion(mutationStr: string): Insertion {
        const key = mutationStr.toUpperCase();
        if (!this.insertionCache.has(key)) {
            this.insertionCache.set(key, Insertion.parse(mutationStr));
        }
        return this.insertionCache.get(key)!;
    }

    private static instance = new MutationCache();

    static getInstance(): MutationCache {
        return this.instance;
    }
}

export interface Mutation {
    readonly segment: string | undefined;
    readonly position: number;
    readonly code: string;
}

export class Substitution implements Mutation {
    readonly code = `${this.segment ? this.segment + ':' : ''}${this.ref}${this.position}${this.alt}`;

    constructor(
        readonly segment: string | undefined,
        readonly ref: string,
        readonly alt: string,
        readonly position: number,
    ) {}

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
                parseInt(parts[0].slice(1, -1)),
            );
        } else if (parts.length === 2) {
            return new Substitution(
                parts[0],
                parts[1].charAt(0),
                parts[1].charAt(parts[1].length - 1),
                parseInt(parts[1].slice(1, -1)),
            );
        }
        throw Error(`Invalid substitution: ${mutationStr}`);
    }
}

export class Deletion implements Mutation {
    readonly code = `${this.segment ? this.segment + ':' : ''}${this.ref}${this.position}-`;

    constructor(readonly segment: string | undefined, readonly ref: string, readonly position: number) {}

    toString() {
        return this.code;
    }

    static parse(mutationStr: string): Deletion {
        const substitution = Substitution.parse(mutationStr);
        if (substitution.alt !== '-') {
            throw Error(`Invalid deletion: ${mutationStr}`);
        }
        return new Deletion(substitution.segment, substitution.ref, substitution.position);
    }
}

export class Insertion implements Mutation {
    readonly code = `ins_${this.segment ? this.segment + ':' : ''}${this.position}:${this.value}`;

    constructor(readonly segment: string | undefined, readonly position: number, readonly value: string) {}

    toString() {
        return this.code;
    }

    static parse(mutationStr: string): Insertion {
        const insertionStr = mutationStr.slice(4);
        const parts = insertionStr.split(':');
        if (parts.length === 2) {
            return new Insertion(undefined, parseInt(parts[0]), parts[1]);
        } else if (parts.length === 3) {
            return new Insertion(parts[0], parseInt(parts[1]), parts[2]);
        }
        throw Error(`Invalid insertion: ${mutationStr}`);
    }
}
