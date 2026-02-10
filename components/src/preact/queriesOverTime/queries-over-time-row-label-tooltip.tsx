import type { FunctionComponent } from 'preact';

import type { CountCoverageQuery } from './queries-over-time';

export type QueriesOverTimeRowLabelTooltipProps = {
    query: CountCoverageQuery;
};

export const QueriesOverTimeRowLabelTooltip: FunctionComponent<QueriesOverTimeRowLabelTooltipProps> = ({ query }) => {
    return (
        <div className='flex flex-col gap-2'>
            <div className='font-bold'>{query.displayLabel}</div>
            {query.description && <div className='text-sm text-gray-700'>{query.description}</div>}
            <div className='flex flex-col gap-1'>
                <div className='text-sm'>
                    <span className='text-gray-600'>Count query:</span>
                    <div className='p-2 border border-gray-200 rounded bg-gray-50 overflow-x-auto'>
                        <pre className='text-xs'>
                            <code>{query.countQuery}</code>
                        </pre>
                    </div>
                </div>
                <div className='text-sm'>
                    <span className='text-gray-600'>Coverage query:</span>
                    <div className='p-2 border border-gray-200 rounded bg-gray-50 overflow-x-auto'>
                        <pre className='text-xs'>
                            <code>{query.coverageQuery}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
