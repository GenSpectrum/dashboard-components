import { type StoryObj } from '@storybook/preact';
import { expect, fireEvent, waitFor, within } from '@storybook/test';
import { type Meta } from '@storybook/web-components';

import Tabs from './tabs';

const meta: Meta = {
    title: 'Component/Tabs',
    component: 'ComponentTabs',
    parameters: { fetchMock: {} },
};

export default meta;

export const TabsStory: StoryObj = {
    render: () => {
        const firstTab = {
            title: 'Tab 1',
            content: <p>Tab 1 Content</p>,
        };

        const secondTab = {
            title: 'Tab 2',
            content: <p>Tab 2 Content</p>,
        };

        const toolbar = <p>Toolbar</p>;

        return <Tabs tabs={[firstTab, secondTab]} toolbar={toolbar} />;
    },
};

export const TabsWithToolbarOnlyShowingOnSecondTab: StoryObj = {
    render: () => {
        const firstTab = {
            title: 'FirstTab',
            content: <p>Tab 1 Content</p>,
        };

        const secondTab = {
            title: 'SecondTab',
            content: <p>Tab 2 Content</p>,
        };

        const toolbar = (activeTab: string) => {
            return <>{activeTab === 'SecondTab' && <p>Toolbar</p>}</>;
        };

        return <Tabs tabs={[firstTab, secondTab]} toolbar={toolbar} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByRole('button', { name: 'SecondTab' })).toBeVisible());
        await expect(canvas.queryByText('Toolbar')).not.toBeInTheDocument();

        await fireEvent.click(canvas.getByRole('button', { name: 'SecondTab' }));
        await waitFor(() => expect(canvas.getByText('Toolbar')).toBeVisible());
    },
};
