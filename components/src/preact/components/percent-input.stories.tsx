import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { PercentInput, type PercentInputProps } from './percent-intput';

const meta: Meta<PercentInputProps> = {
    title: 'Component/Percent input',
    component: PercentInput,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent<{
    value: number;
    setValue: (value: number) => void;
}> = ({ value: initialValue, setValue: setExternalValue }) => {
    const [value, setValue] = useState(initialValue);

    return (
        <PercentInput
            percentage={value}
            setPercentage={(value: number) => {
                setValue(value);
                setExternalValue(value);
            }}
        />
    );
};

export const PercentInputStory: StoryObj<{
    value: number;
    setValue: (value: number) => void;
}> = {
    render: (args) => {
        return <WrapperWithState {...args} />;
    },
    args: {
        value: 5,
        setValue: fn(),
    },
    play: async ({ canvasElement, step, args }) => {
        const canvas = within(canvasElement);

        const input = () => canvas.getByLabelText('%');

        await step('Expect initial value to be 5%', async () => {
            await expect(input()).toHaveValue(5);
        });

        await step('Add digits', async () => {
            await userEvent.type(input(), '1');
            await waitFor(() => expect(args.setValue).toHaveBeenCalledWith(51));
            await expect(input()).toHaveValue(51);
        });

        await step('Remove digits', async () => {
            await userEvent.type(input(), '{backspace}');
            await waitFor(() => expect(args.setValue).toHaveBeenCalledWith(5));
            await expect(input()).toHaveValue(5);
        });

        await step('Entering a dot should not trigger the external update function', async () => {
            await waitFor(() => expect(args.setValue).toHaveBeenCalledTimes(2));
            await userEvent.type(input(), '.');
            await waitFor(() => expect(args.setValue).toHaveBeenCalledTimes(2));
        });

        await step('Deleting all digits should not trigger the external update function', async () => {
            await waitFor(() => expect(args.setValue).toHaveBeenCalledTimes(2));
            await userEvent.clear(input());
            await waitFor(() => expect(args.setValue).toHaveBeenCalledTimes(2));
        });

        await step('Entering a number outside the range should not trigger the external update function', async () => {
            await userEvent.type(input(), '10');
            await waitFor(() => expect(args.setValue).toHaveBeenCalledTimes(4));
            await userEvent.type(input(), '1');
            await waitFor(() => expect(args.setValue).toHaveBeenCalledTimes(4));
        });

        await step(
            'Removing digits until a valid number is reached triggers the external update function',
            async () => {
                await userEvent.type(input(), '{backspace}');
                await waitFor(() => expect(args.setValue).toHaveBeenCalledWith(10));
                await expect(input()).toHaveValue(10);
            },
        );
    },
};
