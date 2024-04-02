import { Meta, StoryObj } from '@storybook/preact';
import { ProportionSelector } from './proportion-selector';
import { ProportionSelectorDropdown, ProportionSelectorDropdownProps } from './proportion-selector-dropdown';
import { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { expect, fn, userEvent, within } from '@storybook/test';

const meta: Meta<ProportionSelectorDropdownProps> = {
    title: 'Component/Proportion selector dropdown',
    component: ProportionSelector,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent<{
    setMinProportion: (value: number) => void;
    setMaxProportion: (value: number) => void;
}> = ({ setMinProportion, setMaxProportion }) => {
    const [wrapperMinProportion, setWrapperMinProportion] = useState(0.05);
    const [wrapperMaxProportion, setWrapperMaxProportion] = useState(1);

    return (
        <ProportionSelectorDropdown
            minProportion={wrapperMinProportion}
            maxProportion={wrapperMaxProportion}
            setMinProportion={(value: number) => {
                setWrapperMinProportion(value);
                setMinProportion(value);
            }}
            setMaxProportion={(value: number) => {
                setWrapperMaxProportion(value);
                setMaxProportion(value);
            }}
        />
    );
};

export const ProportionSelectorStory: StoryObj<ProportionSelectorDropdownProps> = {
    render: (args) => {
        return <WrapperWithState setMinProportion={args.setMinProportion} setMaxProportion={args.setMaxProportion} />;
    },
    args: {
        setMinProportion: fn(),
        setMaxProportion: fn(),
    },
    play: async ({ canvasElement, step, args }) => {
        const canvas = within(canvasElement);

        await step('Expect initial proportion to show on the button', async () => {
            const button = canvas.getByRole('button');
            await expect(button).toHaveTextContent('Proportion 5.0% - 100.0%');
        });

        await step('Change min proportion and expect it to show on the button', async () => {
            const button = canvas.getByRole('button');
            await userEvent.click(button);

            const minInput = canvas.getAllByLabelText('%')[0];
            await userEvent.clear(minInput);
            await userEvent.type(minInput, '10');

            await expect(button).toHaveTextContent('Proportion 10.0% - 100.0%');
            await expect(args.setMinProportion).toHaveBeenCalledWith(0.1);
        });
    },
};
