import { describe, expect, it } from 'vitest';

import { MockOperator } from './MockOperator';
import { RenameFieldOperator } from './RenameFieldOperator';

const mockOperator = new MockOperator([
    { id: 1, value: 1 },
    { id: 2, value: 2 },
    { id: 3, value: 3 },
    { id: 4, value: 4 },
    { id: 5, value: 5 },
]);

describe('RenameFieldOperator', () => {
    it('should map the keys', async () => {
        const underTest = new RenameFieldOperator(mockOperator, 'value', 'mappedValue');

        const result = await underTest.evaluate('lapis');

        expect(result.content).deep.equal([
            { id: 1, value: 1, mappedValue: 1 },
            { id: 2, value: 2, mappedValue: 2 },
            { id: 3, value: 3, mappedValue: 3 },
            { id: 4, value: 4, mappedValue: 4 },
            { id: 5, value: 5, mappedValue: 5 },
        ]);
    });
});
