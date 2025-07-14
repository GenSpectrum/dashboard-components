import { describe, it } from 'vitest';

import { type Equals, type Expect } from './typeAssertions';

/* eslint-disable @typescript-eslint/no-unused-vars */
describe('Expect', () => {
    it('should only accept true', () => {
        type ShouldBeTrue = Expect<true>;
        // @ts-expect-error Expect should only accept true
        type ShouldFail = Expect<false>;
    });
});

describe('Equals', () => {
    it('should accept equal types', () => {
        type Equals1 = Expect<Equals<1, 1>>;
        type Equals1Or2 = Expect<Equals<1 | 2, 1 | 2>>;
        type EqualsWithObject = Expect<Equals<{ key: string }, { key: string }>>;
    });

    it('should reject unequal types', () => {
        // @ts-expect-error 1 is not 2
        type Equals1Vs2 = Expect<Equals<1, 2>>;
        // @ts-expect-error disjoint union types
        type EqualsDisjointUnion = Expect<Equals<1 | 2, 1 | 999>>;
        // @ts-expect-error object with different keys
        type EqualsObjectWithDifferentKey = Expect<Equals<{ key: string }, { otherKey: string }>>;
        // @ts-expect-error object with different value types
        type EqualsObjectWithDifferentValue = Expect<Equals<{ key: string }, { key: number }>>;
    });
});
