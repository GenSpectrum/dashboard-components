import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fireEvent, fn, waitFor, within } from '@storybook/test';
import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { type ColorScale, ColorScaleSelector, type ColorScaleSelectorProps } from './color-scale-selector';

const meta: Meta<ColorScaleSelectorProps> = {
    title: 'Component/Color scale selector',
    component: ColorScaleSelector,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent<{
    setColorScale: (colorScale: ColorScale) => void;
}> = ({ setColorScale }) => {
    const [internalColorScale, setInternalColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });

    return (
        <ColorScaleSelector
            colorScale={internalColorScale}
            setColorScale={(colorScale) => {
                setColorScale(colorScale);
                setInternalColorScale(colorScale);
            }}
        />
    );
};

export const ColorScaleSelectorStory: StoryObj<ColorScaleSelectorProps> = {
    render: (args) => {
        return <WrapperWithState {...args} />;
    },
    args: {
        setColorScale: fn(),
    },
    play: async ({ canvasElement, step, args }) => {
        const canvas = within(canvasElement);

        await step('Expect initial value to be 0 and value 100%', async () => {
            await expect(canvas.getAllByText('%', { exact: false })[0]).toHaveTextContent('0%');
            await expect(canvas.getAllByText('%', { exact: false })[1]).toHaveTextContent('100%');
        });

        await step('Move min slider to 20%', async () => {
            const minSlider = canvas.getAllByRole('slider')[0];
            await fireEvent.input(minSlider, { target: { value: '20' } });
            await expect(args.setColorScale).toHaveBeenCalledWith({ min: 0.2, max: 1, color: 'indigo' });
            await waitFor(() => expect(canvas.getAllByText('%', { exact: false })[0]).toHaveTextContent('20%'));
        });

        await step('Move max slider to 80%', async () => {
            const maxSlider = canvas.getAllByRole('slider')[1];
            await fireEvent.input(maxSlider, { target: { value: '80' } });
            await expect(args.setColorScale).toHaveBeenCalledWith({ min: 0.2, max: 0.8, color: 'indigo' });
            await waitFor(() => expect(canvas.getAllByText('%', { exact: false })[1]).toHaveTextContent('80%'));
        });
    },
};
