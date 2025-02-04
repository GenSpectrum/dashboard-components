import { consume } from '@lit/context';
import { expect, waitFor, within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import './gs-app';

import { lapisContext } from './lapis-context';
import { referenceGenomeContext } from './reference-genome-context';
import { withComponentDocs } from '../../.storybook/ComponentDocsBlock';
import { LAPIS_URL, REFERENCE_GENOME_ENDPOINT } from '../constants';
import type { ReferenceGenome } from '../lapisApi/ReferenceGenome';
import referenceGenome from '../lapisApi/__mockData__/referenceGenome.json';

const codeExample = String.raw`
<gs-app lapis="https://url.to.lapis">
    <p>Your application code goes here.</p> 
</gs-app>`;

const meta: Meta = {
    title: 'Wrapper/App',
    component: 'gs-app',
    parameters: withComponentDocs({
        fetchMock: {},
        componentDocs: {
            opensShadowDom: false,
            expectsChildren: true,
            codeExample,
        },
    }),
    tags: ['autodocs'],
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

        await waitFor(async () => {
            await expect(canvas.getByText(LAPIS_URL)).toBeVisible();
            await expect(canvas.getByText('"name": "ORF1a",', { exact: false })).toBeVisible();
        });
    },
};

export const WithNoLapisUrl: StoryObj<{ lapis: string }> = {
    ...Default,
    args: {
        ...Default.args,
        lapis: 'notAValidUrl',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(async () => {
            await expect(canvas.getByText("Error: Invalid LAPIS URL: 'notAValidUrl'", { exact: false })).toBeVisible();
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
        lapis: 'https://url.to.lapis-definitely-not-a-valid-url',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(async () => {
            await expect(canvas.getByText('Error: Cannot fetch reference genome.', { exact: false })).toBeVisible();
        });
    },
};

@customElement('gs-app-display')
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
