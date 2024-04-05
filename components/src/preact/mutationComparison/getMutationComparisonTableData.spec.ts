import { describe, expect, it } from 'vitest';

import { getMutationComparisonTableData } from './getMutationComparisonTableData';
import { type MutationData } from './mutation-comparison';
import { type Dataset } from '../../operator/Dataset';
import { Substitution } from '../../utils/mutations';

describe('getPrevalenceOverTimeTableData', () => {
    it('should flatten the data to CSV format', () => {
        const data: Dataset<MutationData> = {
            content: [
                {
                    displayName: 'Test 1',
                    data: [
                        {
                            type: 'substitution',
                            mutation: new Substitution(undefined, 'A', 'T', 123),
                            count: 1,
                            proportion: 0.123,
                        },
                        {
                            type: 'substitution',
                            mutation: new Substitution(undefined, 'G', 'A', 234),
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
                            mutation: new Substitution(undefined, 'A', 'T', 123),
                            count: 3,
                            proportion: 0.345,
                        },
                        {
                            type: 'substitution',
                            mutation: new Substitution(undefined, 'G', 'A', 234),
                            count: 4,
                            proportion: 0.789,
                        },
                    ],
                },
            ],
        };

        const result = getMutationComparisonTableData(data);

        expect(result).toEqual([
            {
                mutation: 'A123T',
                'Test 1 prevalence': 0.123,
                'Test 2 prevalence': 0.345,
            },
            {
                mutation: 'G234A',
                'Test 1 prevalence': 0.567,
                'Test 2 prevalence': 0.789,
            },
        ]);
    });
});
