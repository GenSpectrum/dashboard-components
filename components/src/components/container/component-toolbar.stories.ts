import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-toolbar';

const meta: Meta = {
    title: 'Component/Toolbar',
    component: 'gs-component-toolbar',
    parameters: { fetchMock: {} },
};

export default meta;

export const ToolbarStory: StoryObj = {
    render: () => {
        const toolbarTop = html` <div>Toolbar Top</div>`;
        const toolbarBottom = html` <div>Toolbar Bottom</div>`;

        return html`
            <div class="max-w-screen-sm">
                <gs-component-toolbar .topElements=${[toolbarTop]} .bottomElements=${[toolbarBottom]}>
                    <div class="flex justify-center px-4 py-16 bg-base-200">Some Content</div>
                </gs-component-toolbar>
            </div>
        `;
    },
};
