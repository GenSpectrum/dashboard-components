import { MockQuery } from './MockQuery';
import { expect } from '@open-wc/testing';
import { SortQuery } from './SortQuery';

describe('SortQuery', () => {
    it('should sort the content of the child query', async () => {
        const child = new MockQuery([3, 1, 2]);
        const query = new SortQuery(child, (a, b) => a - b);
        const result = await query.evaluate('lapis');
        await expect(result.content).deep.equal([1, 2, 3]);
    });
});
