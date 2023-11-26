import { MockQuery } from './MockQuery';
import { GroupByAndSumQuery } from './GroupByAndSumQuery';
import { expectEqualAfterSorting } from '../test-utils';

describe('GroupByAndSumQuery', () => {
    it('should group the content of the child query and calculate the sum if a field', async () => {
        const child = new MockQuery([
            { lineage: 'A', n: 1 },
            { lineage: 'A', n: 2 },
            { lineage: 'B', n: 3 },
        ]);

        const query = new GroupByAndSumQuery(child, 'lineage', 'n');
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
