import type { FunctionComponent } from 'preact';

import { type QueryDefinition } from '../../lapisApi/lapisTypes';

export type QueriesOverTimeRowLabelTooltipProps = {
    query: QueryDefinition;
};

export const QueriesOverTimeRowLabelTooltip: FunctionComponent<QueriesOverTimeRowLabelTooltipProps> = ({
    query,
}: QueriesOverTimeRowLabelTooltipProps) => {
    return (
        <div className='flex flex-col gap-2'>
            <div className='font-bold'>{query.displayLabel}</div>
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
