import { describe, expect, it } from 'vitest';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import { type SubstitutionEntry } from '../../types';
import { SubstitutionClass } from '../../utils/mutations';

describe('getPrevalenceOverTimeTableData', () => {
    it('should flatten the data to CSV format', () => {
        const data: Dataset<MutationData> = {
            content: [
                {
                    displayName: 'Test 1',
                    data: [
                        {
                            type: 'substitution',
                            mutation: new SubstitutionClass(undefined, 'A', 'T', 123),
                            count: 1,
                            proportion: 0.123,
                        },
                        {
                            type: 'substitution',
                            mutation: new SubstitutionClass(undefined, 'G', 'A', 234),
                            count: 2,
                            proportion: 0.567,
                        },
                    ],
                },
                {
                    displayName: 'Test 2',
                    data: [
                        {
                            type: 'substitution',
                            mutation: new SubstitutionClass(undefined, 'A', 'T', 123),
                            count: 3,
                            proportion: 0.345,
                        },
                        {
                            type: 'substitution',
                            mutation: new SubstitutionClass(undefined, 'G', 'A', 234),
                            count: 4,
                            proportion: 0.789,
                        },
                    ],
                },
            ],
        };

        const result = getMutationComparisonTableData(data, { min: 0, max: 1 });

        expect(result).toEqual([
            {
                mutation: new SubstitutionClass(undefined, 'A', 'T', 123),
                'Test 1 prevalence': 0.123,
                'Test 2 prevalence': 0.345,
            },
            {
                mutation: new SubstitutionClass(undefined, 'G', 'A', 234),
                'Test 1 prevalence': 0.567,
                'Test 2 prevalence': 0.789,
            },
        ]);
    });

    it('should filter out when no proportion value is in interval', () => {
        function makeSubstitutionWithProportionAtPosition(proportion: number, position: number): SubstitutionEntry {
            return {
                type: 'substitution',
                mutation: new SubstitutionClass(undefined, 'A', 'T', position),
                count: 1,
                proportion,
            };
        }

        const belowRange = 0.1;
        const inRange = 0.2;
        const aboveRange = 0.3;

        const data: Dataset<MutationData> = {
            content: [
                {
                    displayName: 'Test 1',
                    data: [
                        makeSubstitutionWithProportionAtPosition(belowRange, 100),
                        makeSubstitutionWithProportionAtPosition(inRange, 200),
                        makeSubstitutionWithProportionAtPosition(inRange, 300),
                        makeSubstitutionWithProportionAtPosition(inRange, 400),
                        makeSubstitutionWithProportionAtPosition(aboveRange, 500),
                    ],
                },
                {
                    displayName: 'Test 2',
                    data: [
                        makeSubstitutionWithProportionAtPosition(belowRange, 100),
                        makeSubstitutionWithProportionAtPosition(belowRange, 200),
                        makeSubstitutionWithProportionAtPosition(inRange, 300),
                        makeSubstitutionWithProportionAtPosition(aboveRange, 400),
                        makeSubstitutionWithProportionAtPosition(aboveRange, 500),
                    ],
                },
            ],
        };

        const result = getMutationComparisonTableData(data, { min: 0.15, max: 0.25 });

        expect(result).toEqual([
            {
                mutation: new SubstitutionClass(undefined, 'A', 'T', 200),
                'Test 1 prevalence': inRange,
                'Test 2 prevalence': belowRange,
            },
            {
                mutation: new SubstitutionClass(undefined, 'A', 'T', 300),
                'Test 1 prevalence': inRange,
                'Test 2 prevalence': inRange,
            },
            {
                mutation: new SubstitutionClass(undefined, 'A', 'T', 400),
                'Test 1 prevalence': inRange,
                'Test 2 prevalence': aboveRange,
            },
        ]);
    });
});
