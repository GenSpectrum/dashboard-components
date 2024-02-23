import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-toolbar-button';

const meta: Meta = {
    title: 'Component/Toolbar button',
    component: 'gs-component-toolbar-button',
};

export default meta;

const Template: StoryObj = {
    render: () => html`<gs-component-toolbar-button>Button</gs-component-toolbar-button>`,
};

export const ButtonStory = {
    ...Template,
};
