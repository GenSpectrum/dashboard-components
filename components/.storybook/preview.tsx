import { Preview, setCustomElementsManifest } from '@storybook/web-components';
import '../src/styles/tailwind.css';
import { REFERENCE_GENOME_ENDPOINT } from '../src/constants';
import referenceGenome from '../src/lapisApi/__mockData__/referenceGenome.json';
import customElements from '../custom-elements.json';
import DocumentationTemplate from './DocumentationTemplate.mdx';

setCustomElementsManifest(customElements);

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        fetchMock: {
            catchAllMocks: [
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
                        overwriteRoutes: false,
                    },
                },
            ],
        },
        docs: {
            page: DocumentationTemplate,
        },
    },
};

export default preview;
