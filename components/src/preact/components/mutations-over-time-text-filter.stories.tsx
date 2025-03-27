import { type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { type Meta } from '@storybook/web-components';
import { useState } from 'preact/hooks';

import { MutationsOverTimeTextFilter, type TextFilterProps } from './mutations-over-time-text-filter';

const meta: Meta = {
    title: 'Component/Mutations over time text filter',
    component: 'MutationsOverTimeTextFilter',
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState = ({ setFilterValue, value }: { setFilterValue: (value: string) => void; value: string }) => {
    const [state, setState] = useState(value);

    return (
        <MutationsOverTimeTextFilter
            setFilterValue={(value) => {
                setFilterValue(value);
                setState(value);
            }}
            value={state}
        />
    );
};

export const MutationsOverTimeTextFilterStory: StoryObj<TextFilterProps> = {
    render: (args) => {
        return <WrapperWithState setFilterValue={args.setFilterValue} value={args.value} />;
    },
    args: {
        setFilterValue: fn(),
        value: 'Test',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Expect initial value to show on the button', async () => {
            const button = canvas.getByRole('button');
            await expect(button).toHaveTextContent('Test');
        });

        await step('Change filter and expect it to show on the button', async () => {
            const button = canvas.getByRole('button');
            await userEvent.click(button);

            const inputField = canvas.getByRole('textbox');
            await userEvent.clear(inputField);
            await userEvent.type(inputField, 'OtherText');

            await waitFor(() => expect(button).toHaveTextContent('OtherText'));
        });
    },
};
