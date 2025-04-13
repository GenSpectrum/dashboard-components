import type { Preview } from '@storybook/preact';
import { clearAllMocks } from '@storybook/test';

import { withActions } from '@storybook/addon-actions/decorator';
import { GS_ERROR_EVENT_TYPE } from '../src/preact/components/error-display';

import '../src/styles/tailwind.css';
import './applyDaisyUiToRootInsteadOfHost.css';
import '../src/preact/components/min-max-percent-slider.css';
import 'gridjs/dist/theme/mermaid.css';
import 'flatpickr/dist/flatpickr.min.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        actions: { handles: [GS_ERROR_EVENT_TYPE] },
    },
    decorators: [withActions],
    beforeEach: () => {
        clearAllMocks();
    },
};

export default preview;
