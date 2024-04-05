import { expect, describe, it } from 'vitest';

import { MockOperator } from './MockOperator';
import { SortOperator } from './SortOperator';

describe('SortOperator', () => {
    it('should sort the content of the child operator', async () => {
        const child = new MockOperator([3, 1, 2]);
        const query = new SortOperator(child, (a, b) => a - b);
        const result = await query.evaluate('lapis');
        await expect(result.content).deep.equal([1, 2, 3]);
    });
});
