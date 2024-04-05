import { describe, expect, it } from 'vitest';

import { filterMutationData } from './queryMutationData';
import { type MutationEntry, type SubstitutionOrDeletion } from '../../operator/FetchMutationsOperator';
import { Deletion, Substitution } from '../../utils/mutations';

const segment = 'testSegment';
const displayedSegment = { segment, label: 'label', checked: true };

describe('filterMutationData', () => {
    function makeMutation({
        segment,
        type,
    }: {
        segment: string | undefined;
        type: SubstitutionOrDeletion;
    }): MutationEntry {
        switch (type) {
            case 'substitution':
                return {
                    type: 'substitution',
                    mutation: new Substitution(segment, 'A', 'B', 0),
                    count: 0,
                    proportion: 0,
                };
            case 'deletion':
                return {
                    type: 'deletion',
                    mutation: new Deletion(segment, 'A', 0),
                    count: 0,
                    proportion: 0,
                };
        }
    }

    it('should filter deletions', () => {
        const result = filterMutationData(
            [
                {
                    displayName: 'test',
                    data: [
                        makeMutation({ segment, type: 'substitution' }),
                        makeMutation({ segment, type: 'deletion' }),
                    ],
                },
            ],
            [displayedSegment],
            [
                { type: 'deletion', label: 'label', checked: true },
                { type: 'substitution', label: 'label', checked: false },
            ],
        );

        expect(result[0].data).to.have.length(1);
        expect(result[0].data[0].type).to.equal('deletion');
    });

    it('should filter substitutions', () => {
        const result = filterMutationData(
            [
                {
                    displayName: 'test',
                    data: [
                        makeMutation({ segment, type: 'substitution' }),
                        makeMutation({ segment, type: 'deletion' }),
                    ],
                },
            ],
            [displayedSegment],
            [
                { type: 'deletion', label: 'label', checked: false },
                { type: 'substitution', label: 'label', checked: true },
            ],
        );

        expect(result[0].data).to.have.length(1);
        expect(result[0].data[0].type).to.equal('substitution');
    });

    it('should filter by segment', () => {
        const otherSegment = 'otherSegment';
        const result = filterMutationData(
            [
                {
                    displayName: 'test',
                    data: [
                        makeMutation({ segment, type: 'substitution' }),
                        makeMutation({ segment: otherSegment, type: 'substitution' }),
                    ],
                },
            ],
            [
                { segment, label: 'label', checked: true },
                { segment: otherSegment, label: 'label', checked: false },
            ],
            [{ type: 'substitution', label: 'label', checked: true }],
        );

        expect(result[0].data).to.have.length(1);
        expect(result[0].data[0].mutation.segment).to.equal(segment);
    });

    it('should never filter out undefined segments', () => {
        const result = filterMutationData(
            [
                {
                    displayName: 'test',
                    data: [makeMutation({ segment: undefined, type: 'substitution' })],
                },
            ],
            [{ segment, label: 'label', checked: false }],
            [{ type: 'substitution', label: 'label', checked: true }],
        );

        expect(result[0].data).to.have.length(1);
        expect(result[0].data[0].mutation.segment).to.equal(undefined);
    });
});
