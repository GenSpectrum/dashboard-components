import { MockQuery } from './MockQuery';
import { FillMissingQuery } from './FillMissingQuery';
import { expectEqualAfterSorting } from '../test-utils';

describe('FillMissingQuery', () => {
    it('should fill in missing values', async () => {
        const child = new MockQuery([{ id: 1 }, { id: 3 }]);
        const query = new FillMissingQuery(
            child,
            'id',
            (ids) => [Math.min(...ids), Math.max(...ids)],
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
