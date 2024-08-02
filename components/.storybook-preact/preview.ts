import type { Preview } from '@storybook/preact';

import '../src/styles/tailwind.css';
import { withActions } from '@storybook/addon-actions/decorator';
import { GS_ERROR_EVENT_TYPE } from '../src/preact/components/error-display';

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
};

export default preview;
