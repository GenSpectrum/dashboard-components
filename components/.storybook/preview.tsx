import { Preview, setCustomElementsManifest } from '@storybook/web-components';
import { REFERENCE_GENOME_ENDPOINT, WISE_REFERENCE_GENOME_ENDPOINT } from '../src/constants';
import referenceGenome from '../src/lapisApi/__mockData__/referenceGenome.json';
import customElements from '../custom-elements.json';
import DocumentationTemplate from './DocumentationTemplate.mdx';
import { withActions } from '@storybook/addon-actions/decorator';
import { GS_ERROR_EVENT_TYPE } from '../src/preact/components/error-display';

setCustomElementsManifest(customElements);

export const previewHandles = [GS_ERROR_EVENT_TYPE];

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
                {
                    matcher: {
                        name: 'wiseReferenceGenome',
                        url: WISE_REFERENCE_GENOME_ENDPOINT,
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
        actions: { handles: previewHandles },
    },
    decorators: [withActions],
};

export default preview;
