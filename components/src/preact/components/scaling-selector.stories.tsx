import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Meta, StoryObj } from '@storybook/preact';
import { SelectProps } from './select';
import { ScalingSelector, ScalingSelectorProps } from './scaling-selector';

const meta: Meta<SelectProps> = {
    title: 'Component/Scaling selector',
    component: ScalingSelector,
    parameters: { fetchMock: {} },
};

export default meta;

export const ScalingSelectorStory: StoryObj<ScalingSelectorProps> = {
    args: {
        yAxisScaleType: 'linear',
        setYAxisScaleType: fn(),
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.selectOptions(canvas.getByRole('combobox'), 'logarithmic');
        await waitFor(() => expect(args.setYAxisScaleType).toHaveBeenCalledWith('logarithmic'));
    },
};
