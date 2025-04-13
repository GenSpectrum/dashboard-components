import { type Meta, type StoryObj } from '@storybook/web-components';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { type NumberFilterProps } from '../../preact/numberFilter/number-filter';

import './gs-number-filter';

const codeExample = String.raw`
<gs-number-filter
  TODO 
</gs-number-filter>`;

const meta: Meta<NumberFilterProps> = {
    title: 'Input/Number filter',
    component: 'gs-number-filter',
    parameters: withComponentDocs({
        actions: {
            handles: ['gs-number-filter-changed'],
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
        return `<gs-number-filter
            value=${args.value}
            lapisField="${args.lapisField}"
            placeholderText="${args.placeholderText}"
            width="${args.width}">
        </gs-number-filter>`;
    },
    args: {
        lapisField: 'age',
        placeholderText: 'Enter age',
        value: { min: 10, max: 90 },
        width: '100%',
    },
};
