import type { Preview } from '@storybook/preact';
import { clearAllMocks } from '@storybook/test';

import { withActions } from '@storybook/addon-actions/decorator';
import { gsEventNames } from '../src/utils/gsEventNames';

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
        actions: { handles: [gsEventNames.error] },
    },
    decorators: [withActions],
    beforeEach: () => {
        clearAllMocks();
    },
};

export default preview;
