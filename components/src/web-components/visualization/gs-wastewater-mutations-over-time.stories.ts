import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-wastewater-mutations-over-time';
import '../app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { WISE_LAPIS_URL } from '../../constants';
import { type WastewaterMutationsOverTimeProps } from '../../preact/wastewater/mutationsOverTime/wastewater-mutations-over-time';

const codeExample = String.raw`
<gs-wastewater-mutations-over-time
    locations='[]'
    width='100%'
    height='700px'
></gs-wastewater-mutations-over-time>`;

const meta: Meta<Required<WastewaterMutationsOverTimeProps>> = {
    title: 'Visualization/Wastewater mutations over time',
    component: 'gs-wastewater-mutations-over-time',
    argTypes: {
        locations: { control: 'object' },
        width: { control: 'text' },
        height: { control: 'text' },
    },
    args: {
        locations: [],
        width: '100%',
        height: '700px',
    },
    parameters: withComponentDocs({
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
        fetchMock: {},
    }),
    tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<Required<WastewaterMutationsOverTimeProps>> = {
    render: (args) => html`
        <gs-app lapis="${WISE_LAPIS_URL}">
            <gs-wastewater-mutations-over-time
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
            ></gs-wastewater-mutations-over-time>
        </gs-app>
    `,
};
