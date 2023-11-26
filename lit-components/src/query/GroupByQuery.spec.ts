import { MockQuery } from './MockQuery';
import { expect } from '@open-wc/testing';
import { GroupByQuery } from './GroupByQuery';

describe('GroupByQuery', () => {
    it('should group the content of the child query', async () => {
        const child = new MockQuery([
            { lineage: 'A', n: 1 },
            { lineage: 'A', n: 2 },
            { lineage: 'B', n: 3 },
        ]);

        const queryCount = new GroupByQuery(child, 'lineage', (values) => ({
            lineage: values[0].lineage,
            n: values.length,
        }));
        const resultCount = await queryCount.evaluate('lapis');
        await expect(resultCount.content).deep.equal([
            { lineage: 'A', n: 2 },
            { lineage: 'B', n: 1 },
        ]);

        const querySum = new GroupByQuery(child, 'lineage', (values) => ({
            lineage: values[0].lineage,
            n: values.reduce((a, b) => a + b.n, 0),
        }));
        const resultSum = await querySum.evaluate('lapis');
        await expect(resultSum.content).deep.equal([
            { lineage: 'A', n: 3 },
            { lineage: 'B', n: 3 },
        ]);
    });
});
