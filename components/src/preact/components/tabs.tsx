import { Fragment, FunctionComponent } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

type Tab = {
    title: string;
    content: JSXInternal.Element;
};

interface ComponentTabsProps {
    tabs: Tab[];
    toolbar?: JSXInternal.Element;
}

const Tabs: FunctionComponent<ComponentTabsProps> = ({ tabs, toolbar }) => {
    const tabNames = tabs.map((tab) => tab.title).join(', ');

    const tabElements = tabs.map((tab, index) => (
        <Fragment key={tab.title}>
            <input
                type='radio'
                name={tabNames}
                role='tab'
                className='tab'
                aria-label={tab.title}
                checked={index === 0}
            />
            <div role='tabpanel' className='tab-content bg-base-100 border-base-300 rounded-box p-1'>
                {tab.content}
            </div>
        </Fragment>
    ));

    return (
        <div role='tablist' className='tabs tabs-lifted'>
            {tabElements}
            {toolbar && <div className='m-1 col-[9999]'>{toolbar}</div>}
        </div>
    );
};

export default Tabs;
