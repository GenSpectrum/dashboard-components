import { Meta, StoryObj } from '@storybook/preact';
import { ProportionSelector, ProportionSelectorProps } from './proportion-selector';

const meta: Meta<ProportionSelectorProps> = {
    title: 'Component/Proportion selector',
    component: ProportionSelector,
    parameters: { fetchMock: {} },
};

export default meta;

export const ProportionSelectorStory: StoryObj<ProportionSelectorProps> = {
    render: () => {
        return <ProportionSelector />;
    },
};
