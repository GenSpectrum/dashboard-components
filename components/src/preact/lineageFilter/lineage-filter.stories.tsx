import { type Meta, type StoryObj } from '@storybook/preact';

import { LineageFilter, type LineageFilterProps } from './lineage-filter';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { LapisUrlContext } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectInvalidAttributesErrorMessage';

const meta: Meta = {
    title: 'Input/LineageFilter',
    component: LineageFilter,
    parameters: {
        actions: {
            handles: ['gs-lineage-filter-changed', ...previewHandles],
        },
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'pangoLineage',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            fields: ['pangoLineage'],
                        },
                    },
                    response: {
                        status: 200,
                        body: aggregatedData,
                    },
                },
            ],
        },
    },
    args: {
        lapisField: 'pangoLineage',
        placeholderText: 'Enter lineage',
        initialValue: '',
        width: '100%',
    },
};

export default meta;

export const Default: StoryObj<LineageFilterProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <LineageFilter
                lapisField={args.lapisField}
                placeholderText={args.placeholderText}
                initialValue={args.initialValue}
                width={args.width}
            />
        </LapisUrlContext.Provider>
    ),
};

export const WithNoLapisField: StoryObj<LineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        lapisField: '',
    },
    play: async ({ canvasElement, step }) => {
        step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};
