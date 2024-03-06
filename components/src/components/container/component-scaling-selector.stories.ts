import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-scaling-selector';

const meta: Meta = {
    title: 'Component/Scaling Selector',
    component: 'gs-component-scaling-selector',
};

export default meta;

export const ScalingSelectorStory: StoryObj = {
    render: () => html`<gs-component-scaling-selector />`,
};
