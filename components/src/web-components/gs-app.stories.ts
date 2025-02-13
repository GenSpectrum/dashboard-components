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
import { type MutationAnnotations, mutationAnnotationsContext } from './mutation-annotations-context';
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

type StoryProps = { lapis: string; mutationAnnotations: MutationAnnotations };

const Template: StoryObj<StoryProps> = {
    render: (args) => {
        return html` <gs-app lapis="${args.lapis}" .mutationAnnotations="${args.mutationAnnotations}">
            <gs-app-display></gs-app-display>
        </gs-app>`;
    },
    args: {
        lapis: LAPIS_URL,
        mutationAnnotations: [
            {
                name: 'I am an annotation!',
                description: 'This describes what is special about these mutations.',
                symbol: '*',
                nucleotideMutations: ['C44T', 'C774T', 'G24872T', 'T23011-'],
                aminoAcidMutations: ['S:501Y', 'S:S31-', 'ORF1a:S4286C'],
            },
        ],
    },
};

export const Default: StoryObj<StoryProps> = {
    ...Template,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(async () => {
            await expect(canvas.getByText(LAPIS_URL)).toBeVisible();
            await expect(canvas.getByText('"name": "ORF1a",', { exact: false })).toBeVisible();
            await expect(canvas.getByText('I am an annotation!', { exact: false })).toBeVisible();
        });
    },
};

export const WithNoLapisUrl: StoryObj<StoryProps> = {
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

export const DelayFetchingReferenceGenome: StoryObj<StoryProps> = {
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

export const FailsToFetchReferenceGenome: StoryObj<StoryProps> = {
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

    @consume({ context: mutationAnnotationsContext, subscribe: true })
    mutationAnnotations: MutationAnnotations = [];

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
            <h2 class="text-lg font-bold">Mutation annotations</h2>
            <pre><code>${JSON.stringify(this.mutationAnnotations, null, 2)}</code></pre>
        `;
    }

    override createRenderRoot() {
        return this;
    }
}
