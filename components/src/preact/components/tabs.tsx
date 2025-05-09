import { forwardRef } from 'preact/compat';
import { useState } from 'preact/hooks';
import { type JSXInternal } from 'preact/src/jsx';

type Tab = {
    title: string;
    content: JSXInternal.Element;
};

interface ComponentTabsProps {
    tabs: Tab[];
    toolbar?: JSXInternal.Element | ((activeTab: string) => JSXInternal.Element);
}

const Tabs = forwardRef<HTMLDivElement, ComponentTabsProps>(({ tabs, toolbar }, ref) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.title);

    const tabElements = (
        <div className='flex flex-row flex-wrap'>
            {tabs.map((tab) => {
                return (
                    <button
                        key={tab.title}
                        className={`px-4 py-2 text-sm font-medium leading-5 transition-colors duration-150 ${
                            activeTab === tab.title
                                ? 'border-b-2 border-gray-500'
                                : 'border-b border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                        onClick={() => {
                            setActiveTab(tab.title);
                        }}
                    >
                        {tab.title}
                    </button>
                );
            })}
        </div>
    );

    const toolbarElement = typeof toolbar === 'function' ? toolbar(activeTab) : toolbar;

    return (
        <div ref={ref} className='h-full w-full flex flex-col'>
            <div className='flex flex-row justify-between flex-wrap'>
                {tabElements}
                {toolbar && <div className='py-2 flex flex-wrap gap-y-1'>{toolbarElement}</div>}
            </div>
            <div className={`p-2 grow overflow-scroll border-2 border-gray-100 rounded-b-md rounded-tr-md`}>
                {tabs.map((tab) => (
                    <div className='h-full' key={tab.title} hidden={activeTab !== tab.title}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Tabs;
