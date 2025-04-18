import { describe, it } from 'vitest';

import { GroupByOperator } from './GroupByOperator';
import { MockOperator } from './MockOperator';
import { expectEqualAfterSorting } from '../utils/test-utils';

describe('GroupByOperator', () => {
    it('should group the content of the child operator', async () => {
        const child = new MockOperator([
            { lineage: 'A', n: 1 },
            { lineage: 'A', n: 2 },
            { lineage: 'B', n: 3 },
        ]);

        const queryCount = new GroupByOperator(child, 'lineage', (values) => ({
            lineage: values[0].lineage,
            n: values.length,
        }));
        const resultCount = await queryCount.evaluate('lapis');
        expectEqualAfterSorting(
            resultCount.content,
            [
                { lineage: 'A', n: 2 },
                { lineage: 'B', n: 1 },
            ],
            (a, b) => a.lineage.localeCompare(b.lineage),
        );

        const querySum = new GroupByOperator(child, 'lineage', (values) => ({
            lineage: values[0].lineage,
            n: values.reduce((a, b) => a + b.n, 0),
        }));
        const resultSum = await querySum.evaluate('lapis');
        expectEqualAfterSorting(
            resultSum.content,
            [
                { lineage: 'A', n: 3 },
                { lineage: 'B', n: 3 },
            ],
            (a, b) => a.lineage.localeCompare(b.lineage),
        );
    });
});
