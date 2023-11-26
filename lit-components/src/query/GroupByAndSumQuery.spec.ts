import { MockQuery } from './MockQuery';
import { expect } from '@open-wc/testing';
import { GroupByAndSumQuery } from './GroupByAndSumQuery';

describe('GroupByAndSumQuery', () => {
    it('should group the content of the child query and calculate the sum if a field', async () => {
        const child = new MockQuery([
            { lineage: 'A', n: 1 },
            { lineage: 'A', n: 2 },
            { lineage: 'B', n: 3 },
        ]);

        const queryCount = new GroupByAndSumQuery(child, 'lineage', 'n');
        const resultCount = await queryCount.evaluate('lapis');
        await expect(resultCount.content).deep.equal([
            { lineage: 'A', n: 3 },
            { lineage: 'B', n: 3 },
        ]);
    });
});
