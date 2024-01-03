import { MockOperator } from './MockOperator';
import { MapOperator } from './MapOperator';
import { expect } from '@open-wc/testing';

describe('MapOperator', () => {
    it('should map the content of the child operator', async () => {
        const child = new MockOperator([1, 2, 3]);
        const query = new MapOperator(child, (x) => x * 2);
        const result = await query.evaluate('lapis');
        await expect(result.content).deep.equal([2, 4, 6]);
    });
});
