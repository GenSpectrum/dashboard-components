import { Meta } from '@storybook/web-components';
import Tabs from './tabs';

const meta: Meta = {
    title: 'Component/Tabs',
    component: 'ComponentTabs',
    parameters: { fetchMock: {} },
};

export default meta;

export const TabsStory = {
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
