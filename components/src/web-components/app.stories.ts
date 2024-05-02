import { consume } from '@lit/context';
import { withActions } from '@storybook/addon-actions/decorator';
import { expect, waitFor, within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import './app';

import { lapisContext } from './lapis-context';
import { referenceGenomeContext } from './reference-genome-context';
import { LAPIS_URL, REFERENCE_GENOME_ENDPOINT } from '../constants';
import type { ReferenceGenome } from '../lapisApi/ReferenceGenome';
import referenceGenome from '../lapisApi/__mockData__/referenceGenome.json';

const meta: Meta = {
    title: 'Wrapper/App',
    component: 'gs-app',
    parameters: {
        fetchMock: {},
    },
    decorators: [withActions],
};

export default meta;

const Template: StoryObj<{ lapis: string }> = {
    render: (args) => {
        return html` <gs-app lapis="${args.lapis}">
            <gs-app-display></gs-app-display>
        </gs-app>`;
    },
    args: {
        lapis: LAPIS_URL,
    },
};

export const Default: StoryObj<{ lapis: string }> = {
    ...Template,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            expect(canvas.getByText(LAPIS_URL)).toBeVisible();
            expect(canvas.getByText('"name": "ORF1a",', { exact: false })).toBeVisible();
        });
    },
};

export const DelayFetchingReferenceGenome: StoryObj<{ lapis: string }> = {
    ...Template,
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
                        body: referenceGenome,
                    },
                    options: {
                        delay: 5000,
                    },
                },
            ],
        },
    },
};

export const FailsToFetchReferenceGenome: StoryObj<{ lapis: string }> = {
    ...Template,
    args: {
        lapis: 'definitely-not-a-valid-url',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            expect(canvas.getByText('Error')).toBeVisible();
        });
    },
};

@customElement('gs-app-display')
// @ts-expect-error This class is used in the story above, but TS complains that it is not used
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars -- it is used in the story above
class AppDisplay extends LitElement {
    @consume({ context: lapisContext })
    lapis: string = '';

    @consume({ context: referenceGenomeContext, subscribe: true })
    referenceGenome: ReferenceGenome = {
        nucleotideSequences: [],
        genes: [],
    };

    override render() {
        return html`
            <h1 class="text-xl font-bold">Dummy component</h1>
            <p>
                What you can see here is a dummy component that displays the values of the wrapping "gs-app". Actually
                "gs-app" doesn't display anything.
            </p>
            <h2 class="text-lg font-bold">LAPIS URL</h2>
            <p>${this.lapis}</p>
            <h2 class="text-lg font-bold">Reference genomes</h2>
            <pre><code>${JSON.stringify(this.referenceGenome, null, 2)}</code></pre>
        `;
    }

    override createRenderRoot() {
        return this;
    }
}
