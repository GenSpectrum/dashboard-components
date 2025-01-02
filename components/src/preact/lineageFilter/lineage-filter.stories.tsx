import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fireEvent, fn, waitFor, within } from '@storybook/test';

import { LineageFilter, type LineageFilterProps } from './lineage-filter';
import { previewHandles } from '../../../.storybook/preview';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import aggregatedData from '../../preact/lineageFilter/__mockData__/aggregated.json';
import { LapisUrlContext } from '../LapisUrlContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

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

export const WithInitialValue: StoryObj<LineageFilterProps> = {
    ...Default,
    args: {
        ...Default.args,
        initialValue: 'XCB',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        const changedListenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-lineage-filter-changed', changedListenerMock);
        });

        await waitFor(() => {
            const input = canvas.getByPlaceholderText('Enter lineage', { exact: false });
            expect(input).toHaveValue('XCB');
        });

        await step('Remove initial value', async () => {
            await fireEvent.click(canvas.getByRole('button', { name: '✕' }));

            await expect(changedListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        host: undefined,
                    },
                }),
            );
        });
    },
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
