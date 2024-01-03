import { MockOperator } from './MockOperator';
import { expect } from '@open-wc/testing';

describe('MockOperator', () => {
    it('should be a mock', async () => {
        const query = new MockOperator([1, 2, 3]);
        const result = await query.evaluate();
        await expect(result.content).to.deep.equal([1, 2, 3]);
    });
});
