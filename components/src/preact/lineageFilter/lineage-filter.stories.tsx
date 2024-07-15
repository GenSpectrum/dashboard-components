import { withActions } from '@storybook/addon-actions/decorator';
import { type Meta, type StoryObj } from '@storybook/preact';

import { LineageFilter, type LineageFilterProps } from './lineage-filter';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { LapisUrlContext } from '../LapisUrlContext';

const meta: Meta = {
    title: 'Input/LineageFilter',
    component: LineageFilter,
    parameters: {
        actions: {
            handles: ['gs-lineage-filter-changed'],
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
    decorators: [withActions],
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
    args: {
        lapisField: 'pangoLineage',
        placeholderText: 'Enter lineage',
        initialValue: '',
        width: '100%',
    },
};
