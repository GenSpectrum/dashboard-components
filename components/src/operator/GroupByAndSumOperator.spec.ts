import { MockOperator } from './MockOperator';
import { GroupByAndSumOperator } from './GroupByAndSumOperator';
import { expectEqualAfterSorting } from '../test-utils';
import { describe, it } from 'vitest';

describe('GroupByAndSumOperator', () => {
    it('should group the content of the child operator and calculate the sum if a field', async () => {
        const child = new MockOperator([
            { lineage: 'A', n: 1 },
            { lineage: 'A', n: 2 },
            { lineage: 'B', n: 3 },
        ]);

        const query = new GroupByAndSumOperator(child, 'lineage', 'n');
        const result = await query.evaluate('lapis');
        await expectEqualAfterSorting(
            result.content,
            [
                { lineage: 'A', n: 3 },
                { lineage: 'B', n: 3 },
            ],
            (a, b) => a.lineage.localeCompare(b.lineage),
        );
    });
});
