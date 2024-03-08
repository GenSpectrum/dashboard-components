import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-headline';

const meta: Meta = {
    title: 'Component/Headline',
    component: 'gs-component-headline',
    parameters: { fetchMock: {} },
};

export default meta;

export const HeadlineStory: StoryObj = {
    render: () =>
        html`<gs-component-headline heading="Test">
            <div class="flex justify-center px-4 py-16 bg-base-200">Some Content</div>
        </gs-component-headline> `,
};
