import { describe, expect, test } from 'vitest';

import { getMutationsTableData } from './getMutationsTableData';
import { Deletion, Substitution } from '../../utils/mutations';

describe('getMutationsTableData', () => {
    test('should return the correct data', () => {
        const data = [
            {
                type: 'substitution' as const,
                mutation: new Substitution('segment1', 'A', 'T', 123),
                count: 1,
                proportion: 0.1,
            },
            {
                type: 'deletion' as const,
                mutation: new Deletion('segment2', 'C', 123),
                count: 2,
                proportion: 0.2,
            },
        ];

        const result = getMutationsTableData(data);

        expect(result).toEqual([
            {
                mutation: 'segment1:A123T',
                type: 'substitution',
                count: 1,
                proportion: 0.1,
            },
            {
                mutation: 'segment2:C123-',
                type: 'deletion',
                count: 2,
                proportion: 0.2,
            },
        ]);
    });
});
