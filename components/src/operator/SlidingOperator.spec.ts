import { MockOperator } from './MockOperator';
import { SlidingOperator } from './SlidingOperator';
import { expectEqualAfterSorting } from '../utils/test-utils';
import { describe, it } from 'vitest';

const mockOperator = new MockOperator([
    { id: 1, value: 1 },
    { id: 2, value: 2 },
    { id: 3, value: 3 },
    { id: 4, value: 4 },
    { id: 5, value: 5 },
]);
describe('SlidingOperator', () => {
    it('should slide the values', async () => {
        const underTest = getSlidingOperatorWithWindowSize(3);

        const result = await underTest.evaluate('lapis');

        expectEqualAfterSorting(
            result.content,
            [
                { id: 2, sum: 6 },
                { id: 3, sum: 9 },
                { id: 4, sum: 12 },
            ],
            sortById,
        );
    });

    it('should return single value when window size is greater than number of entries', async () => {
        const underTest = getSlidingOperatorWithWindowSize(999);

        const result = await underTest.evaluate('lapis');

        expectEqualAfterSorting(result.content, [{ id: 2, sum: 15 }], sortById);
    });

    function getSlidingOperatorWithWindowSize(windowSize: number) {
        return new SlidingOperator(mockOperator, windowSize, (values) => {
            let sum = 0;
            for (const { value } of values) {
                sum += value;
            }
            return { id: values[1].id, sum };
        });
    }

    function sortById(a: { id: number }, b: { id: number }) {
        return a.id - b.id;
    }
});
