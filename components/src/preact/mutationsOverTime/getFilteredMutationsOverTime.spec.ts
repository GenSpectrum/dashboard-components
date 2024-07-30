import { describe, expect, it } from 'vitest';

import { filterDisplayedSegments, filterMutationTypes, filterProportion } from './getFilteredMutationsOverTimeData';
import { type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { Map2dBase } from '../../utils/map2d';
import { Deletion, Substitution } from '../../utils/mutations';
import { type Temporal } from '../../utils/temporal';
import { yearMonthDay } from '../../utils/temporalTestHelpers';

describe('getFilteredMutationOverTimeData', () => {
    describe('filterDisplayedSegments', () => {
        it('should filter by displayed segments', () => {
            const data = new Map2dBase<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>();

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
            const data = new Map2dBase<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>();

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
        const belowFilter = 0.1;
        const atFilterMin = 0.2;
        const inFilter = 0.5;
        const atFilterMax = 0.9;
        const aboveFilter = 0.99;
        const proportionInterval = { min: atFilterMin, max: atFilterMax };

        const someSubstitution = new Substitution('someSegment', 'A', 'T', 123);
        const someOtherMutation = new Substitution('someOtherSegment', 'A', 'G', 9);

        it('should remove mutations where overall proportion is below filter', () => {
            const data = getMutationOverTimeData();

            filterProportion(data, getOverallMutationData(belowFilter), proportionInterval);

            expect(data.getAsArray({ count: 0, proportion: 0 })).to.toHaveLength(0);
        });

        it('should remove mutations where overall proportion is above filter', () => {
            const data = getMutationOverTimeData();

            filterProportion(data, getOverallMutationData(aboveFilter), proportionInterval);

            expect(data.getAsArray({ count: 0, proportion: 0 })).to.toHaveLength(0);
        });

        it('should remove mutations where overall proportion is missing', () => {
            const data = getMutationOverTimeData();

            filterProportion(data, getOverallMutationData(aboveFilter, someOtherMutation), proportionInterval);

            expect(data.getAsArray({ count: 0, proportion: 0 })).to.toHaveLength(0);
        });

        it('should not remove mutation where overall proportion is at lower border of filter', () => {
            const data = getMutationOverTimeData();

            filterProportion(data, getOverallMutationData(inFilter), proportionInterval);

            expect(data.getRow(someSubstitution, { count: 0, proportion: 0 })).to.toHaveLength(2);
        });

        it('should not remove mutation where overall proportion is within filter', () => {
            const data = getMutationOverTimeData();

            filterProportion(data, getOverallMutationData(inFilter), proportionInterval);

            expect(data.getRow(someSubstitution, { count: 0, proportion: 0 })).to.toHaveLength(2);
        });

        it('should not remove mutation where overall proportion is at upper border of filter', () => {
            const data = getMutationOverTimeData();

            filterProportion(data, getOverallMutationData(inFilter), proportionInterval);

            expect(data.getRow(someSubstitution, { count: 0, proportion: 0 })).to.toHaveLength(2);
        });

        function getMutationOverTimeData() {
            const data = new Map2dBase<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>();
            data.set(someSubstitution, yearMonthDay('2021-01-01'), { count: 1, proportion: 0.1 });
            data.set(someSubstitution, yearMonthDay('2021-02-02'), { count: 99, proportion: 0.99 });
            return data;
        }

        function getOverallMutationData(proportion: number = 0.1, mutation: Substitution = someSubstitution) {
            return {
                content: [
                    {
                        type: 'substitution' as const,
                        count: -1,
                        mutation,
                        proportion,
                    },
                ],
            };
        }
    });
});
