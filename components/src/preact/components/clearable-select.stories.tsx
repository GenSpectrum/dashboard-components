import { type Meta, type StoryObj } from '@storybook/preact';
import { fn, userEvent, within } from '@storybook/test';

import { ClearableSelect, type ClearableSelectProps } from './clearable-select';
import { expectOptionSelected } from '../shared/stories/expectOptionSelected';

const meta: Meta<ClearableSelectProps> = {
    title: 'Component/ClearableSelect',
    component: ClearableSelect,
    parameters: { fetchMock: {} },
};

export default meta;

export const Default: StoryObj<ClearableSelectProps> = {
    render: (args) => (
        <div className='flex justify-center px-4 py-16'>
            <ClearableSelect {...args} />
        </div>
    ),
    args: {
        items: ['firstOption', 'secondOption'],
        onChange: fn(),
    },
    play: async ({ canvasElement, step }) => {
        await step('Show default placeholder', async () => {
            await expectOptionSelected(canvasElement, 'Select an option');
        });
    },
};

export const UseInitialSelectedItem: StoryObj<ClearableSelectProps> = {
    ...Default,
    args: {
        ...Default.args,
        initiallySelectedItem: 'firstOption',
    },
    play: async ({ canvasElement, step }) => {
        await step('Show initiallySelectedItem', async () => {
            await expectOptionSelected(canvasElement, 'firstOption');
        });
    },
};

export const SwitchToOption: StoryObj<ClearableSelectProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Select an option', async () => {
            await userEvent.selectOptions(getSelectElement(canvas), 'firstOption');
            await expectOptionSelected(canvasElement, 'firstOption');
        });
    },
};

export const ClearOption: StoryObj<ClearableSelectProps> = {
    ...Default,
    args: {
        ...Default.args,
        initiallySelectedItem: 'firstOption',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Clear the selected option', async () => {
            await userEvent.click(canvas.getByRole('button', { name: '×' }));
            await expectOptionSelected(canvasElement, 'Select an option');
        });
    },
};

const getSelectElement = (canvas: ReturnType<typeof within>) => {
    return canvas.getByRole('combobox');
};
