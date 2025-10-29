import { type Meta, type StoryObj } from '@storybook/preact';

import { MultiLineageFilter, type MultiLineageFilterProps } from './lineage-filter-multi';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import lineageDefinition from './__mockData__/lineageDefinition.json';
import { lineageDefinitionEndpoint } from '../../lapisApi/lapisApi';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { gsEventNames } from '../../utils/gsEventNames';
import { LapisUrlContextProvider } from '../LapisUrlContext';

const meta: Meta = {
    title: 'Input/MultiLineageFilter',
    component: MultiLineageFilter,
    parameters: {
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
    },
    argTypes: {
        lapisField: {
            control: {
                type: 'text',
            },
        },
        placeholderText: {
            control: {
                type: 'text',
            },
        },
        value: {
            control: {
                type: 'text',
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

    args: {
        lapisField: 'pangoLineage',
        lapisFilter: {
            country: 'Germany',
        },
        placeholderText: 'Select lineages',
        value: ['A.1', 'B.1'],
        width: '100%',
        hideCounts: false,
    },
};

export default meta;

export const Default: StoryObj<MultiLineageFilterProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <MultiLineageFilter {...args} />
        </LapisUrlContextProvider>
    ),
};
