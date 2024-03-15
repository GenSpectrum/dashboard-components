import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-select';
import { expect, userEvent, waitFor, within } from '@storybook/test';

const meta: Meta = {
    title: 'Component/Select',
    component: 'gs-select',
    parameters: { fetchMock: {} },
    argTypes: {
        onSelectChange: { action: true },
        items: { control: { type: 'array' } },
        selected: { control: { type: 'text' } },
        selectStyle: { control: { type: 'text' } },
    },
};

export default meta;

export const SelectStory: StoryObj = {
    render: (args) => html`
        <gs-select
            .items=${args.items}
            .selected=${args.selected}
            selectStyle=${args.selectStyle}
            @selectChange=${args.onSelectChange}
        ></gs-select>
    `,

    args: {
        items: [
            { label: 'Disabled element', value: 'disabledElement', disabled: true },
            { label: 'First', value: 'first' },
            { label: 'Second', value: 'second' },
        ],
        selected: 'first',
        selectStyle: 'select-bordered',
    },
};

export const SelectStorySelectingSecond: StoryObj = {
    ...SelectStory,
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);

        await userEvent.selectOptions(canvas.getByRole('combobox'), 'second');
        await waitFor(() => expect(args.onSelectChange).toHaveBeenCalledOnce());
    },
};
