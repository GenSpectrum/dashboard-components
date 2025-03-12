import { describe, expect, it } from 'vitest';

import { BaseMutationOverTimeDataMap } from './MutationOverTimeData';
import { getFilteredMutationOverTimeData } from './getFilteredMutationsOverTimeData';
import { type MutationOverTimeMutationValue } from '../../query/queryMutationsOverTime';
import { type DeletionEntry, type SubstitutionEntry } from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type TemporalClass } from '../../utils/temporalClass';
import { yearMonthDay } from '../../utils/temporalTestHelpers';

describe('getFilteredMutationOverTimeData', () => {
    it('should filter by displayed segments', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            someSubstitutionEntry,
            anotherSubstitutionEntry,
            someDeletionEntry,
        ]);

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [
                { segment: 'someSegment', checked: false, label: 'Some Segment' },
                { segment: 'someOtherSegment', checked: true, label: 'Some Other Segment' },
            ],
            displayedMutationTypes: [],
            proportionInterval,
            displayMutations: undefined,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([anotherSubstitution]);
    });

    it('should filter by mutation types', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            someSubstitutionEntry,
            anotherSubstitutionEntry,
            someDeletionEntry,
        ]);

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [
                {
                    type: 'substitution',
                    checked: false,
                    label: 'Substitution',
                },
                {
                    type: 'deletion',
                    checked: true,
                    label: 'Deletion',
                },
            ],
            proportionInterval,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([someDeletion]);
    });

    it('should remove mutations where overall proportion is below filter', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            { ...someSubstitutionEntry, proportion: belowFilter },
            { ...anotherSubstitutionEntry, proportion: inFilter },
            { ...someDeletionEntry, proportion: inFilter },
        ]);

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([anotherSubstitution, someDeletion]);
    });

    it('should remove mutations where overall proportion is above filter', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            { ...someSubstitutionEntry, proportion: aboveFilter },
            { ...anotherSubstitutionEntry, proportion: inFilter },
            { ...someDeletionEntry, proportion: inFilter },
        ]);

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([anotherSubstitution, someDeletion]);
    });

    it('should not remove mutations where overall proportion is above filter but single proportion is below filter', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            someSubstitutionEntry,
            anotherSubstitutionEntry,
            someDeletionEntry,
        ]);
        data.set(someSubstitution, someTemporal, { ...someMutationOverTimeValue, proportion: belowFilter });

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([someSubstitution, anotherSubstitution, someDeletion]);
    });

    it('should not remove mutations where overall proportion is below max but single proportion is above max', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            someSubstitutionEntry,
            anotherSubstitutionEntry,
            someDeletionEntry,
        ]);
        data.set(someSubstitution, someTemporal, { ...someMutationOverTimeValue, proportion: aboveFilter });

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([someSubstitution, anotherSubstitution, someDeletion]);
    });

    it('should not remove mutations where overall proportion is at lower bound of filter', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            { ...someSubstitutionEntry, proportion: atFilterMin },
            { ...anotherSubstitutionEntry, proportion: inFilter },
            { ...someDeletionEntry, proportion: inFilter },
        ]);
        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([someSubstitution, anotherSubstitution, someDeletion]);
    });

    it('should not remove mutations where overall proportion is at upper bound of filter', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            { ...someSubstitutionEntry, proportion: atFilterMax },
            { ...anotherSubstitutionEntry, proportion: inFilter },
            { ...someDeletionEntry, proportion: inFilter },
        ]);

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([someSubstitution, anotherSubstitution, someDeletion]);
    });

    it('should filter by displayMutations', () => {
        const { data, overallMutationData } = prepareMutationOverTimeData([
            someSubstitutionEntry,
            anotherSubstitutionEntry,
            someDeletionEntry,
        ]);

        const result = getFilteredMutationOverTimeData({
            data,
            overallMutationData,
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
            displayMutations: [anotherSubstitution.code, someDeletion.code],
        });

        expect(result.getFirstAxisKeys()).to.deep.equal([anotherSubstitution, someDeletion]);
    });

    const belowFilter = 0.1;
    const atFilterMin = 0.2;
    const inFilter = 0.5;
    const atFilterMax = 0.9;
    const aboveFilter = 0.99;
    const proportionInterval = { min: atFilterMin, max: atFilterMax };

    const someSubstitution: Substitution = {
        type: 'substitution',
        valueAtReference: 'A',
        substitutionValue: 'T',
        code: 'A123T',
        segment: 'someSegment',
        position: 123,
    };
    const someSubstitutionEntry: SubstitutionEntry<Substitution> = {
        type: 'substitution',
        mutation: someSubstitution,
        count: 234,
        proportion: inFilter,
    };

    const anotherSubstitution: Substitution = {
        type: 'substitution',
        valueAtReference: 'G',
        substitutionValue: 'C',
        code: 'G345C',
        segment: 'someOtherSegment',
        position: 345,
    };
    const anotherSubstitutionEntry: SubstitutionEntry<Substitution> = {
        type: 'substitution',
        mutation: anotherSubstitution,
        count: 456,
        proportion: inFilter,
    };

    const someDeletion: Deletion = {
        type: 'deletion',
        valueAtReference: 'A',
        segment: 'someSegment',
        position: 567,
        code: 'A123-',
    };
    const someDeletionEntry: DeletionEntry<Deletion> = {
        type: 'deletion',
        mutation: someDeletion,
        count: 789,
        proportion: inFilter,
    };
    const someTemporal = yearMonthDay('2021-01-01');
    const anotherTemporal = yearMonthDay('2021-02-02');
    const someMutationOverTimeValue = {
        type: 'value',
        count: 1,
        proportion: inFilter,
        totalCount: 10,
    } satisfies MutationOverTimeMutationValue;

    function prepareMutationOverTimeData(
        mutationEntries: (SubstitutionEntry<Substitution> | DeletionEntry<Deletion>)[],
        temporals: TemporalClass[] = [someTemporal, anotherTemporal],
    ) {
        const data = new BaseMutationOverTimeDataMap();

        temporals.forEach((temporal) => {
            mutationEntries.forEach((entry) => {
                data.set(entry.mutation, temporal, someMutationOverTimeValue);
            });
        });

        return { data, overallMutationData: mutationEntries };
    }
});
