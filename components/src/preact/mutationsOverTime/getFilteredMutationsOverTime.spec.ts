import { describe, expect, it } from 'vitest';

import { getFilteredMutationOverTimeData, type MutationFilter } from './getFilteredMutationsOverTimeData';
import { type DeletionEntry, type SubstitutionEntry } from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type MutationAnnotations } from '../../web-components/mutation-annotations-context';
import { getMutationAnnotationsContext, getMutationAnnotationsProvider } from '../MutationAnnotationsContext';

describe('getFilteredMutationOverTimeData', () => {
    it('should filter by displayed segments', () => {
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [someSubstitutionEntry, anotherSubstitutionEntry, someDeletionEntry],
            displayedSegments: [
                { segment: 'someSegment', checked: false, label: 'Some Segment' },
                { segment: 'someOtherSegment', checked: true, label: 'Some Other Segment' },
            ],
            displayedMutationTypes: [],
            proportionInterval,
            mutationFilterValue: { textFilter: '', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([anotherSubstitution]);
    });

    it('should filter by mutation types', () => {
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [someSubstitutionEntry, anotherSubstitutionEntry, someDeletionEntry],
            displayedSegments: [],
            displayedMutationTypes: [
                { type: 'substitution', checked: false, label: 'Substitution' },
                { type: 'deletion', checked: true, label: 'Deletion' },
            ],
            proportionInterval,
            mutationFilterValue: { textFilter: '', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([someDeletion]);
    });

    it('should remove mutations where overall proportion is below filter', () => {
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [
                { ...someSubstitutionEntry, proportion: belowFilter },
                { ...anotherSubstitutionEntry, proportion: inFilter },
                { ...someDeletionEntry, proportion: inFilter },
            ],
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
            mutationFilterValue: { textFilter: '', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([anotherSubstitution, someDeletion]);
    });

    it('should remove mutations where overall proportion is above filter', () => {
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [
                { ...someSubstitutionEntry, proportion: aboveFilter },
                { ...anotherSubstitutionEntry, proportion: inFilter },
                { ...someDeletionEntry, proportion: inFilter },
            ],
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
            mutationFilterValue: { textFilter: '', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([anotherSubstitution, someDeletion]);
    });

    it('should not remove mutations where overall proportion is at lower bound of filter', () => {
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [
                { ...someSubstitutionEntry, proportion: atFilterMin },
                { ...anotherSubstitutionEntry, proportion: inFilter },
                { ...someDeletionEntry, proportion: inFilter },
            ],
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
            mutationFilterValue: { textFilter: '', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([someSubstitution, anotherSubstitution, someDeletion]);
    });

    it('should not remove mutations where overall proportion is at upper bound of filter', () => {
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [
                { ...someSubstitutionEntry, proportion: atFilterMax },
                { ...anotherSubstitutionEntry, proportion: inFilter },
                { ...someDeletionEntry, proportion: inFilter },
            ],
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
            mutationFilterValue: { textFilter: '', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([someSubstitution, anotherSubstitution, someDeletion]);
    });

    it('should filter by mutation filter text value', () => {
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [someSubstitutionEntry, anotherSubstitutionEntry, someDeletionEntry],
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
            mutationFilterValue: { textFilter: '23T', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([someSubstitution]);
    });

    describe('should filter by annotation', () => {
        const expectFilteredValue = (filterValue: MutationFilter, annotations: MutationAnnotations) => {
            const annotationProvider = getMutationAnnotationsProvider(getMutationAnnotationsContext(annotations));

            const result = getFilteredMutationOverTimeData({
                overallMutationData: [someSubstitutionEntry, anotherSubstitutionEntry, someDeletionEntry],
                displayedSegments: [],
                displayedMutationTypes: [],
                proportionInterval,
                mutationFilterValue: filterValue,
                sequenceType: 'nucleotide',
                annotationProvider,
            });

            expect(result.map((e) => e.mutation)).to.deep.equal([someSubstitution]);
        };

        it('with filter value in symbol', () => {
            expectFilteredValue({ textFilter: '#', annotationNameFilter: new Set() }, [
                { name: 'Annotation 1', description: 'Description 1', symbol: '#', nucleotideMutations: ['A123T'] },
            ]);
        });

        it('with filter value in name', () => {
            expectFilteredValue({ textFilter: 'Annota', annotationNameFilter: new Set() }, [
                { name: 'Annotation 1 #', description: 'Description 1', symbol: '+', nucleotideMutations: ['A123T'] },
            ]);
        });

        it('with filter value in description', () => {
            expectFilteredValue({ textFilter: 'Descr', annotationNameFilter: new Set() }, [
                { name: 'Annotation 1', description: 'Description 1', symbol: '#', nucleotideMutations: ['A123T'] },
            ]);
        });

        it('with annotation name filter', () => {
            expectFilteredValue({ textFilter: '', annotationNameFilter: new Set(['Annotation 1']) }, [
                { name: 'Annotation 1', description: 'Description 1', symbol: '#', nucleotideMutations: ['A123T'] },
            ]);
        });
    });

    it('should not filter by individual time-series proportions below the overall filter', () => {
        // Filtering is based solely on overallMutationData proportions, not per-cell values.
        // An entry whose overall proportion is within range is always kept.
        const result = getFilteredMutationOverTimeData({
            overallMutationData: [someSubstitutionEntry, anotherSubstitutionEntry, someDeletionEntry],
            displayedSegments: [],
            displayedMutationTypes: [],
            proportionInterval,
            mutationFilterValue: { textFilter: '', annotationNameFilter: new Set() },
            sequenceType: 'nucleotide',
            annotationProvider: () => [],
        });

        expect(result.map((e) => e.mutation)).to.deep.equal([someSubstitution, anotherSubstitution, someDeletion]);
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
});
