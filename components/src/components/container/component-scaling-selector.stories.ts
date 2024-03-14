import { expect } from '@storybook/test';
import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-scaling-selector';
import { userEvent, waitFor } from '@storybook/test';
import { withinShadowRoot } from '../../storybook/withinShadowRoot.story';

const meta: Meta = {
    title: 'Component/Scaling Selector',
    component: 'gs-component-scaling-selector',
    argTypes: {
        setYAxisScaleType: { action: true },
    },
    parameters: { fetchMock: {} },
};

export default meta;

export const ScalingSelectorStory: StoryObj = {
    render: ({ setYAxisScaleType }) => html`
        <gs-component-scaling-selector .setYAxisScaleType=${setYAxisScaleType}></gs-component-scaling-selector>
    `,
    play: async ({ canvasElement, args }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-component-scaling-selector');
        await userEvent.selectOptions(canvas.getByRole('combobox'), 'logit');
        await waitFor(() => expect(args.setYAxisScaleType).toHaveBeenCalledWith('logit'));
    },
};
