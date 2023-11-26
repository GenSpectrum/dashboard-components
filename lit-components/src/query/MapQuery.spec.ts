import { MockQuery } from './MockQuery';
import { MapQuery } from './MapQuery';
import { expect } from '@open-wc/testing';

describe('MapQuery', () => {
    it('should map the content of the child query', async () => {
        const child = new MockQuery([1, 2, 3]);
        const query = new MapQuery(child, (x) => x * 2);
        const result = await query.evaluate('lapis');
        await expect(result.content).deep.equal([2, 4, 6]);
    });
});
