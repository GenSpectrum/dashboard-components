import '../gs-app';
import './gs-number-range-filter';

import { type Meta, type StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL } from '../../constants';
import { type NumberRangeFilterProps } from '../../preact/numberRangeFilter/number-range-filter';
import { gsEventNames } from '../../utils/gsEventNames';

const codeExample = String.raw`
<gs-number-range-filter
    value='{"ageFrom": 10, "ageTo": 90}'
    lapisField="age"
    sliderMin="0"
    sliderMax="100"
    sliderStep="1"
    width="50%"
></gs-number-range-filter>`;

const meta: Meta<NumberRangeFilterProps> = {
    title: 'Input/Number range filter',
    component: 'gs-number-range-filter',
    parameters: withComponentDocs({
        actions: {
            handles: [gsEventNames.numberRangeFilterChanged, gsEventNames.numberRangeValueChanged],
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
        sliderMin: {
            control: {
                type: 'number',
            },
        },
        sliderMax: {
            control: {
                type: 'number',
            },
        },
        sliderStep: {
            control: {
                type: 'number',
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

export const Default: StoryObj<NumberRangeFilterProps> = {
    render: (args) => {
        return html`
            <gs-app lapis="${LAPIS_URL}">
                <gs-number-range-filter
                    .value=${args.value}
                    .lapisField=${args.lapisField}
                    .sliderMin=${args.sliderMin}
                    .sliderMax=${args.sliderMax}
                    .sliderStep=${args.sliderStep}
                    .width=${args.width}
                >
                </gs-number-range-filter>
            </gs-app>
        `;
    },
    args: {
        lapisField: 'age',
        value: { min: 10, max: 90 },
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 0.1,
        width: '100%',
    },
};
