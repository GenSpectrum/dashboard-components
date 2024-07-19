import { describe, expect, it } from 'vitest';

import { filterDisplayedSegments, filterMutationTypes, filterProportion } from './getFilteredMutationsOverTimeData';
import { type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { Map2d } from '../../utils/Map2d';
import { Deletion, Substitution } from '../../utils/mutations';
import { type Temporal } from '../../utils/temporal';
import { yearMonthDay } from '../../utils/temporalTestHelpers';

describe('getFilteredMutationOverTimeData', () => {
    describe('filterDisplayedSegments', () => {
        it('should filter by displayed segments', () => {
            const data = new Map2d<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>();

            data.set(new Substitution('someSegment', 'A', 'T', 123), yearMonthDay('2021-01-01'), {
                count: 1,
                proportion: 0.1,
            });
            data.set(new Substitution('someOtherSegment', 'A', 'T', 123), yearMonthDay('2021-01-01'), {
                count: 2,
                proportion: 0.2,
            });

            filterDisplayedSegments(
                [
                    { segment: 'someSegment', checked: false, label: 'Some Segment' },
                    { segment: 'someOtherSegment', checked: true, label: 'Some Other Segment' },
                ],
                data,
            );

            expect(data.getFirstAxisKeys().length).to.equal(1);
            expect(data.getFirstAxisKeys()[0].segment).to.equal('someOtherSegment');
        });
    });

    describe('filterMutationTypes', () => {
        it('should filter by mutation types', () => {
            const data = new Map2d<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>();

            data.set(new Substitution('someSegment', 'A', 'T', 123), yearMonthDay('2021-01-01'), {
                count: 1,
                proportion: 0.1,
            });
            data.set(new Deletion('someOtherSegment', 'A', 123), yearMonthDay('2021-01-01'), {
                count: 2,
                proportion: 0.2,
            });

            filterMutationTypes(
                [
                    { type: 'substitution', checked: false, label: 'Substitution' },
                    { type: 'deletion', checked: true, label: 'Deletion' },
                ],
                data,
            );

            expect(data.getFirstAxisKeys().length).to.equal(1);
            expect(data.getFirstAxisKeys()[0].type).to.equal('deletion');
        });
    });

    describe('filterProportion', () => {
        it('should filter by proportion', () => {
            const data = new Map2d<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>();

            const belowFilter = { count: 1, proportion: 0.1 };
            const aboveFilter = { count: 99, proportion: 0.99 };
            const proportionInterval = { min: 0.2, max: 0.9 };

            const someSubstitution = new Substitution('someSegment', 'A', 'T', 123);
            data.set(someSubstitution, yearMonthDay('2021-01-01'), belowFilter);
            data.set(someSubstitution, yearMonthDay('2021-02-02'), aboveFilter);

            filterProportion(data, proportionInterval);

            expect(data.getAsArray({ count: 0, proportion: 0 }).length).to.equal(0);
        });

        it('should not filter if one proportion is within the interval', () => {
            const data = new Map2d<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>();

            const belowFilter = { count: 1, proportion: 0.1 };
            const aboveFilter = { count: 99, proportion: 0.99 };
            const inFilter = { count: 5, proportion: 0.5 };
            const proportionInterval = { min: 0.2, max: 0.9 };

            const someSubstitution = new Substitution('someSegment', 'A', 'T', 123);
            data.set(someSubstitution, yearMonthDay('2021-01-01'), belowFilter);
            data.set(someSubstitution, yearMonthDay('2021-02-02'), aboveFilter);
            data.set(someSubstitution, yearMonthDay('2021-03-03'), inFilter);

            filterProportion(data, proportionInterval);

            expect(data.getRow(someSubstitution, { count: 0, proportion: 0 }).length).to.equal(3);
        });
    });
});
