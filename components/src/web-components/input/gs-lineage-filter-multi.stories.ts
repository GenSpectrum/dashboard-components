import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import '../gs-app';
import './gs-lineage-filter-multi';
import { lineageDefinitionEndpoint } from '../../lapisApi/lapisApi';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import lineageDefinition from '../../preact/lineageFilter/__mockData__/lineageDefinition.json';
import { type MultiLineageFilterProps } from '../../preact/lineageFilter/lineage-filter-multi';
import { gsEventNames } from '../../utils/gsEventNames';

const codeExample = String.raw`
<gs-lineage-filter-multi
    lapisField="pangoLineage"
    lapisFilter='{"country": "Germany"}'
    placeholderText="Select lineages"
    .value='["B.1.1.7", "BA.5"]'
    width="50%">
</gs-lineage-filter-multi>`;

const meta: Meta<Required<MultiLineageFilterProps>> = {
    title: 'Input/Multi-lineage filter',
    component: 'gs-lineage-filter-multi',
    parameters: withComponentDocs({
        actions: {
            handles: [gsEventNames.lineageFilterChanged, ...previewHandles],
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'pangoLineage',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['pangoLineage'],
                            country: 'Germany',
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                },
                {
                    matcher: {
                        name: 'lineageDefinition',
                        url: lineageDefinitionEndpoint(LAPIS_URL, 'pangoLineage'),
                    },
                    response: {
                        status: 200,
                        body: lineageDefinition,
                    },
                },
            ],
        },
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
    argTypes: {
        lapisField: {
            control: {
                type: 'select',
            },
            options: ['host'],
        },
        placeholderText: {
            control: {
                type: 'text',
            },
        },
        value: {
            control: {
                type: 'object',
            },
        },
        width: {
            control: {
                type: 'text',
            },
        },
        lapisFilter: {
            control: {
                type: 'object',
            },
        },
        hideCounts: {
            control: {
                type: 'boolean',
            },
        },
    },
};

export default meta;

const Template: StoryObj<Required<MultiLineageFilterProps>> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-(--breakpoint-lg)">
                <gs-lineage-filter-multi
                    .lapisField=${args.lapisField}
                    .lapisFilter=${args.lapisFilter}
                    .placeholderText=${args.placeholderText}
                    .hideCounts=${args.hideCounts}
                    .value=${args.value}
                    .width=${args.width}
                ></gs-lineage-filter-multi>
            </div>
        </gs-app>`;
    },
    args: {
        lapisField: 'pangoLineage',
        lapisFilter: {
            country: 'Germany',
        },
        placeholderText: 'Select lineages',
        value: ['B.1.1.7', 'BA.5'],
        width: '100%',
        hideCounts: false,
    },
};

export const Default: StoryObj<Required<MultiLineageFilterProps>> = {
    ...Template,
};
