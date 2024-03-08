import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-tabs';

const meta: Meta = {
    title: 'Component/Tabs',
    component: 'gs-component-tabs',
    parameters: { fetchMock: {} },
};

export default meta;

export const TabsStory: StoryObj = {
    render: () => {
        const firstTab = {
            title: 'Tab 1',
            content: html`<p>Tab 1 Content</p>`,
        };

        const secondTab = {
            title: 'Tab 2',
            content: html`<p>Tab 2 Content</p>`,
        };

        return html` <gs-component-tabs .tabs=${[firstTab, secondTab]}> </gs-component-tabs> `;
    },
};
