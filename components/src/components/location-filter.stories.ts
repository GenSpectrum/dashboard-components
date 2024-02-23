import type { Meta, StoryObj } from '@storybook/web-components';
import { withActions } from '@storybook/addon-actions/decorator';
import { LAPIS_URL } from '../constants';

import { html } from 'lit';
import './app';
import './location-filter';

const meta: Meta<{}> = {
    title: 'Input/Location filter',
    component: 'gs-location-filter',
    parameters: {
        actions: {
            handles: ['gs-location-changed'],
        },
    },
    decorators: [withActions],
};

export default meta;

const Template: StoryObj<{}> = {
    render: () => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <gs-location-filter></gs-location-filter>
        </gs-app>`;
    },
};

export const Default = {
    ...Template,
};
