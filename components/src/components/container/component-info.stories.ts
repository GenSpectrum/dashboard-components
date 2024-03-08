import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-info';

const meta: Meta = {
    title: 'Component/Info',
    component: 'gs-component-info',
    parameters: { fetchMock: {} },
};

export default meta;

export const InfoStory: StoryObj = {
    render: () => {
        const content = 'This is a tooltip which shows some information.';

        return html`
            <div class="flex justify-center px-4 py-16 bg-base-200">
                <gs-component-info content=${content}></gs-component-info>
            </div>
        `;
    },
};
