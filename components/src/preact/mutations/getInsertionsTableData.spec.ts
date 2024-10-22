import { describe, expect, test } from 'vitest';

import { getInsertionsTableData } from './getInsertionsTableData';
import { InsertionClass } from '../../utils/mutations';

describe('getInsertionsTableData', () => {
    test('should return the correct data', () => {
        const insertion1 = new InsertionClass('segment1', 123, 'T');
        const insertion2 = new InsertionClass('segment2', 234, 'AAA');
        const data = [
            {
                type: 'insertion' as const,
                mutation: insertion1,
                count: 1,
                proportion: 0.1,
            },
            {
                type: 'insertion' as const,
                mutation: insertion2,
                count: 2,
                proportion: 0.2,
            },
        ];

        const result = getInsertionsTableData(data);

        expect(result).toEqual([
            {
                insertion: insertion1,
                count: 1,
            },
            {
                insertion: insertion2,
                count: 2,
            },
        ]);
    });
});
