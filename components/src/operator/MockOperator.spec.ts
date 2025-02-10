import { expect, describe, it } from 'vitest';

import { MockOperator } from './MockOperator';

describe('MockOperator', () => {
    it('should be a mock', async () => {
        const query = new MockOperator([1, 2, 3]);
        const result = await query.evaluate();
        expect(result.content).to.deep.equal([1, 2, 3]);
    });
});
