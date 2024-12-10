import { Fragment, type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { type JSXInternal } from 'preact/src/jsx';

type Tab = {
    title: string;
    content: JSXInternal.Element;
};

interface ComponentTabsProps {
    tabs: Tab[];
    toolbar?: JSXInternal.Element | ((activeTab: string) => JSXInternal.Element);
}

const Tabs: FunctionComponent<ComponentTabsProps> = ({ tabs, toolbar }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.title);
    const [heightOfTabs, setHeightOfTabs] = useState('3rem');
    const tabRef = useRef<HTMLDivElement>(null);

    const updateHeightOfTabs = () => {
        if (tabRef.current) {
            const heightOfTabs = tabRef.current.getBoundingClientRect().height;
            setHeightOfTabs(`${heightOfTabs}px`);
        }
    };

    useEffect(() => {
        updateHeightOfTabs();

        window.addEventListener('resize', updateHeightOfTabs);
        return () => {
            window.removeEventListener('resize', updateHeightOfTabs);
        };
    }, []);

    const tabElements = (
        <div className='flex flex-row'>
            {tabs.map((tab) => {
                return (
                    <Fragment key={tab.title}>
                        <button
                            className={`px-4 py-2 text-sm font-medium leading-5 transition-colors duration-150 ${
                                activeTab === tab.title
                                    ? 'border-b-2 border-gray-400'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                            onClick={() => {
                                setActiveTab(tab.title);
                            }}
                        >
                            {tab.title}
                        </button>
                    </Fragment>
                );
            })}
        </div>
    );

    const toolbarElement = typeof toolbar === 'function' ? toolbar(activeTab) : toolbar;

    return (
        <div className='h-full w-full'>
            <div ref={tabRef} className='flex flex-row justify-between flex-wrap'>
                {tabElements}
                {toolbar && <div className='py-2 flex flex-wrap gap-y-1'>{toolbarElement}</div>}
            </div>
            <div
                className={`p-2 border-2 border-gray-100 rounded-b-md rounded-tr-md ${activeTab === tabs[0]?.title ? '' : 'rounded-tl-md'}`}
                style={{ height: `calc(100% - ${heightOfTabs})` }}
            >
                {tabs.map((tab) => (
                    <div className='h-full overflow-auto' key={tab.title} hidden={activeTab !== tab.title}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
