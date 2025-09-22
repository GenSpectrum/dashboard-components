import { expect, fn, userEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { LAPIS_URL, REFERENCE_GENOME_ENDPOINT } from '../../constants';
import '../gs-app';
import { type MutationFilterProps } from '../../preact/mutationFilter/mutation-filter';
import { gsEventNames } from '../../utils/gsEventNames';
import { withinShadowRoot } from '../withinShadowRoot.story';
import './gs-mutation-filter';

const codeExample = String.raw`
<gs-mutation-filter 
    initialValue='["A123T"]'
    width='100%'
></gs-mutation-filter>`;

const meta: Meta<MutationFilterProps> = {
    title: 'Input/Mutation filter',
    component: 'gs-mutation-filter',
    parameters: withComponentDocs({
        actions: {
            handles: [gsEventNames.mutationFilterChanged, ...previewHandles],
        },
        fetchMock: {},
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    argTypes: {
        initialValue: {
            control: {
                type: 'object',
            },
        },
        width: { control: 'text' },
        enabledMutationTypes: {
            control: {
                type: 'object',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<MutationFilterProps> = {
    render: (args) => {
        return html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-(--breakpoint-lg)">
                <gs-mutation-filter
                    .initialValue=${args.initialValue}
                    .width=${args.width}
                    .enabledMutationTypes=${args.enabledMutationTypes}
                ></gs-mutation-filter>
            </div>
        </gs-app>`;
    },
    args: {
        initialValue: [],
        width: '100%',
    },
};

export const Default: StoryObj<MutationFilterProps> = {
    ...Template,
    args: {
        ...Template.args,
        initialValue: ['A123T'],
    },
};

export const FiresFilterChangedEvent: StoryObj<MutationFilterProps> = {
    ...Template,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-filter');

        const inputField = () => canvas.getByPlaceholderText('Enter a mutation', { exact: false });
        const listenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.mutationFilterChanged, listenerMock);
        });

        await step('wait until data is loaded', async () => {
            await waitFor(() => {
                return expect(inputField()).toBeEnabled();
            });
        });

        await step('Enter a valid mutation', async () => {
            await userEvent.type(inputField(), 'A123T');
            const option = await canvas.findByRole('option');
            await userEvent.click(option);

            await waitFor(() =>
                expect(listenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            nucleotideMutations: ['A123T'],
                            aminoAcidMutations: [],
                            nucleotideInsertions: [],
                            aminoAcidInsertions: [],
                        },
                    }),
                ),
            );
        });
    },
};

export const RestrictEnabledMutationTypes: StoryObj<MutationFilterProps> = {
    ...Template,
    args: {
        ...Template.args,
        enabledMutationTypes: ['nucleotideMutations', 'aminoAcidMutations'],
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-filter');

        const inputField = () => canvas.getByPlaceholderText('Enter a mutation', { exact: false });

        await waitFor(async () => {
            const placeholderText = inputField().getAttribute('placeholder');

            await expect(placeholderText).toEqual('Enter a mutation (e.g. 23T, E:57Q)');
        });
    },
};

export const MultiSegmentedReferenceGenomes: StoryObj<MutationFilterProps> = {
    ...Template,
    args: {
        ...Template.args,
        initialValue: ['seg1:3T', 'gene2:4', 'ins_seg2:4:AAA'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'referenceGenome',
                        url: REFERENCE_GENOME_ENDPOINT,
                    },
                    response: {
                        status: 200,
                        body: {
                            nucleotideSequences: [
                                {
                                    name: 'seg1',
                                    sequence: 'dummy',
                                },
                                {
                                    name: 'seg2',
                                    sequence: 'dummy',
                                },
                            ],
                            genes: [
                                {
                                    name: 'gene1',
                                    sequence: 'dummy',
                                },
                                {
                                    name: 'gene2',
                                    sequence: 'dummy',
                                },
                            ],
                        },
                    },
                    options: {
                        overwriteRoutes: false,
                    },
                },
            ],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-filter');

        const inputField = () => canvas.getByPlaceholderText('Enter a mutation', { exact: false });

        await waitFor(async () => {
            const placeholderText = inputField().getAttribute('placeholder');

            await expect(placeholderText).toEqual(
                'Enter a mutation (e.g. seg1:23T, ins_seg1:10462:A, gene1:57Q, ins_gene1:31:N)',
            );
        });

        await waitFor(async () => {
            await expect(canvas.getByText('seg1:3T')).toBeVisible();
            await expect(canvas.getByText('gene2:4')).toBeVisible();
            await expect(canvas.getByText('ins_seg2:4:AAA')).toBeVisible();
        });
    },
};
