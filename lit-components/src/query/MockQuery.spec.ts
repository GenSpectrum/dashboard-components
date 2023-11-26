import { MockQuery } from './MockQuery';
import { expect } from '@open-wc/testing';

describe('MockQuery', () => {
    it('should be a mock', async () => {
        const query = new MockQuery([1, 2, 3]);
        const result = await query.evaluate();
        await expect(result.content).to.deep.equal([1, 2, 3]);
    });
});
