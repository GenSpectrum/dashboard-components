import { MockQuery } from './MockQuery';
import { DivisionQuery } from './DivisionQuery';
import { expectEqualAfterSorting } from '../test-utils';

describe('DivisionQuery', () => {
    it('should divide the values', async () => {
        const numerator = new MockQuery([
            { id: 1, value: 2 },
            { id: 2, value: 4 },
            { id: 3, value: 6 },
        ]);
        const denominator = new MockQuery([
            { id: 1, value: 1 },
            { id: 2, value: 2 },
            { id: 3, value: 2 },
        ]);
        const query = new DivisionQuery(numerator, denominator, 'id', 'value', 'result');
        const result = await query.evaluate('lapis');
        await expectEqualAfterSorting(result.content, [
            { id: 1, result: 2 },
            { id: 2, result: 2 },
            { id: 3, result: 3 },
        ]);
    });
});
