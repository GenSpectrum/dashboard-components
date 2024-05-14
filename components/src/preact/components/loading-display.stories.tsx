import { type Meta, type StoryObj } from '@storybook/preact';

import { LoadingDisplay } from './loading-display';
import { ResizeContainer } from './resize-container';

const meta: Meta = {
    title: 'Component/Loading',
    component: LoadingDisplay,
    parameters: { fetchMock: {} },
};

export default meta;

export const LoadingStory: StoryObj = {
    render: () => (
        <ResizeContainer defaultSize={{ height: '600px', width: '100%' }}>
            <LoadingDisplay />
        </ResizeContainer>
    ),
};
