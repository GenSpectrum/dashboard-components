import { describe, expect, test } from 'vitest';

import { getInsertionsTableData } from './getInsertionsTableData';
import { Insertion } from '../../utils/mutations';

describe('getInsertionsTableData', () => {
    test('should return the correct data', () => {
        const data = [
            {
                type: 'insertion' as const,
                mutation: new Insertion('segment1', 123, 'T'),
                count: 1,
                proportion: 0.1,
            },
            {
                type: 'insertion' as const,
                mutation: new Insertion('segment2', 234, 'AAA'),
                count: 2,
                proportion: 0.2,
            },
        ];

        const result = getInsertionsTableData(data);

        expect(result).toEqual([
            {
                insertion: 'ins_segment1:123:T',
                count: 1,
            },
            {
                insertion: 'ins_segment2:234:AAA',
                count: 2,
            },
        ]);
    });
});
