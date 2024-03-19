import { Meta, StoryObj } from '@storybook/preact';
import Info, { InfoProps } from './info';

const meta: Meta<InfoProps> = {
    title: 'Component/Info',
    component: Info,
    parameters: { fetchMock: {} },
    args: {
        content: 'This is a tooltip which shows some information.',
    },
};

export default meta;

export const InfoStory: StoryObj<InfoProps> = {
    render: (args) => (
        <div class='flex justify-center px-4 py-16 bg-base-200'>
            <Info {...args} />
        </div>
    ),
};
