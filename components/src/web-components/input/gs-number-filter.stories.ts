import '../gs-app';
import './gs-number-filter';

import { type Meta, type StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL } from '../../constants';
import { gsNumberFilterChangedEventName } from '../../preact/numberFilter/NumberFilterChangedEvent';
import { type NumberFilterProps } from '../../preact/numberFilter/number-filter';

const codeExample = String.raw`
<gs-number-filter
  TODO 
</gs-number-filter>`;

const meta: Meta<NumberFilterProps> = {
    title: 'Input/Number filter',
    component: 'gs-number-filter',
    parameters: withComponentDocs({
        actions: {
            handles: [gsNumberFilterChangedEventName],
        },
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
    argTypes: {
        value: {
            control: {
                type: 'object',
            },
        },
        lapisField: {
            control: {
                type: 'text',
            },
        },
        width: {
            control: {
                type: 'text',
            },
        },
    },
};

export default meta;

export const Default: StoryObj<NumberFilterProps> = {
    render: (args) => {
        return html`
            <gs-app lapis="${LAPIS_URL}">
                <gs-number-filter .value=${args.value} .lapisField=${args.lapisField} .width=${args.width}>
                </gs-number-filter>
            </gs-app>
        `;
    },
    args: {
        lapisField: 'age',
        value: { min: 10, max: 90 },
        width: '100%',
    },
};
