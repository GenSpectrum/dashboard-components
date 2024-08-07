import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fireEvent, fn, userEvent, waitFor, within } from '@storybook/test';
import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { ProportionSelector, type ProportionSelectorProps } from './proportion-selector';

const meta: Meta<ProportionSelectorProps> = {
    title: 'Component/Proportion selector',
    component: ProportionSelector,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent<{
    setMinProportion: (value: number) => void;
    setMaxProportion: (value: number) => void;
}> = ({ setMinProportion, setMaxProportion }) => {
    const [proportionInterval, setProportionInterval] = useState({ min: 0.05, max: 1 });

    return (
        <ProportionSelector
            proportionInterval={proportionInterval}
            setMinProportion={(value: number) => {
                setProportionInterval((prev) => ({ ...prev, min: value }));
                setMinProportion(value);
            }}
            setMaxProportion={(value: number) => {
                setProportionInterval((prev) => ({ ...prev, max: value }));
                setMaxProportion(value);
            }}
        />
    );
};

export const ProportionSelectorStory: StoryObj<ProportionSelectorProps> = {
    render: (args) => {
        return <WrapperWithState setMinProportion={args.setMinProportion} setMaxProportion={args.setMaxProportion} />;
    },
    args: {
        setMinProportion: fn(),
        setMaxProportion: fn(),
    },
    play: async ({ canvasElement, step, args }) => {
        const canvas = within(canvasElement);

        await step('Expect initial min proportion to be 5% and max proportion 100%', async () => {
            await expect(canvas.getAllByLabelText('%')[0]).toHaveValue(5);
            await expect(canvas.getAllByLabelText('%')[1]).toHaveValue(100);
        });

        await step('Change min proportion to 10%', async () => {
            const minInput = canvas.getAllByLabelText('%')[0];
            await userEvent.clear(minInput);
            await userEvent.type(minInput, '10');
            await waitFor(() => expect(args.setMinProportion).toHaveBeenCalledWith(0.1));
        });

        await step('Change max proportion to 50%', async () => {
            const maxInput = canvas.getAllByLabelText('%')[1];
            await userEvent.clear(maxInput);
            await userEvent.type(maxInput, '50');
            await waitFor(() => expect(args.setMaxProportion).toHaveBeenCalledWith(0.5));
        });

        await step('Move min proportion silder to 20%', async () => {
            const minSlider = canvas.getAllByRole('slider')[0];
            await fireEvent.input(minSlider, { target: { value: '20' } });
            await waitFor(() => expect(args.setMinProportion).toHaveBeenCalledWith(0.2));
            await waitFor(() => expect(canvas.getAllByLabelText('%')[0]).toHaveValue(20));
        });

        await step('Move max proportion silder to 80%', async () => {
            const maxSlider = canvas.getAllByRole('slider')[1];
            await fireEvent.input(maxSlider, { target: { value: '80' } });
            await waitFor(() => expect(args.setMaxProportion).toHaveBeenCalledWith(0.8));
            await waitFor(() => expect(canvas.getAllByLabelText('%')[1]).toHaveValue(80));
        });
    },
};
