import { Fragment, FunctionComponent } from 'preact';
import { JSXInternal } from 'preact/src/jsx';
import { useState } from 'preact/hooks';

type Tab = {
    title: string;
    content: JSXInternal.Element;
};

interface ComponentTabsProps {
    tabs: Tab[];
    toolbar?: JSXInternal.Element | ((activeTab: string) => JSXInternal.Element);
}

const Tabs: FunctionComponent<ComponentTabsProps> = ({ tabs, toolbar }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].title);

    const tabNames = tabs.map((tab) => tab.title).join(', ');

    const tabElements = tabs.map((tab) => {
        return (
            <Fragment key={tab.title}>
                <input
                    type='radio'
                    name={tabNames}
                    role='tab'
                    className='tab'
                    aria-label={tab.title}
                    checked={activeTab === tab.title}
                    onChange={() => setActiveTab(tab.title)}
                />
                <div role='tabpanel' className='tab-content bg-base-100 border-base-300 rounded-box p-1'>
                    {tab.content}
                </div>
            </Fragment>
        );
    });

    const toolbarElement = typeof toolbar === 'function' ? toolbar(activeTab) : toolbar;

    return (
        <div role='tablist' className='tabs tabs-lifted'>
            {tabElements}
            {toolbar && <div className='m-1 col-[9999]'>{toolbarElement}</div>}
        </div>
    );
};

export default Tabs;
