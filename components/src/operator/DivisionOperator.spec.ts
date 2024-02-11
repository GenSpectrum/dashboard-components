import { MockOperator } from './MockOperator';
import { DivisionOperator } from './DivisionOperator';
import { expectEqualAfterSorting } from '../test-utils';

describe('DivisionOperator', () => {
    it('should divide the values', async () => {
        const numerator = new MockOperator([
            { id: 1, value: 2 },
            { id: 2, value: 4 },
            { id: 3, value: 6 },
        ]);
        const denominator = new MockOperator([
            { id: 1, value: 1 },
            { id: 2, value: 2 },
            { id: 3, value: 2 },
        ]);
        const query = new DivisionOperator(numerator, denominator, 'id', 'value', 'result', 'numerator', 'denominator');
        const result = await query.evaluate('lapis');
        await expectEqualAfterSorting(result.content, [
            { id: 1, result: 2, numerator: 2, denominator: 1 },
            { id: 2, result: 2, numerator: 4, denominator: 2 },
            { id: 3, result: 3, numerator: 6, denominator: 2 },
        ]);
    });
});
