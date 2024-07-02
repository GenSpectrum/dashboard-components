import { describe, it } from 'vitest';

import { FillMissingOperator } from './FillMissingOperator';
import { MockOperator } from './MockOperator';
import { expectEqualAfterSorting } from '../utils/test-utils';

describe('FillMissingOperator', () => {
    it('should fill in missing values', async () => {
        const child = new MockOperator([{ id: 1 }, { id: 3 }]);
        const query = new FillMissingOperator(
            child,
            'id',
            (ids) => {
                return { min: Math.min(...ids), max: Math.max(...ids) };
            },
            (min, max) => {
                const result = [];
                for (let i = min; i <= max; i++) {
                    result.push(i);
                }
                return result;
            },
            (id) => ({ id }),
        );
        const result = await query.evaluate('lapis');
        await expectEqualAfterSorting(result.content, [{ id: 1 }, { id: 2 }, { id: 3 }], (a, b) => a.id - b.id);
    });
});
