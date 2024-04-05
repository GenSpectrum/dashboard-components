import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { Select, type SelectProps } from './select';

const meta: Meta<SelectProps> = {
    title: 'Component/Select',
    component: Select,
    argTypes: {
        onChange: { action: true },
    },
    parameters: { fetchMock: {} },
};

export default meta;

export const SelectStory: StoryObj<SelectProps> = {
    args: {
        items: [
            { label: 'Disabled first element', disabled: true, value: 'does not matter' },
            { label: 'First Option', value: 'firstOption' },
            { label: 'Second Option', value: 'secondOption' },
        ],
        selected: 'firstOption',
        selectStyle: '',
        onChange: fn(),
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.selectOptions(canvas.getByRole('combobox'), 'secondOption');
        await waitFor(() =>
            expect(args.onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'change',
                    target: expect.objectContaining({
                        value: 'secondOption',
                    }),
                }),
            ),
        );
    },
};
