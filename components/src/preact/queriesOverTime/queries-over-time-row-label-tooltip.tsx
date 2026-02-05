import type { FunctionComponent } from 'preact';

export type QueriesOverTimeRowLabelTooltipProps = {
    query: string; // displayLabel -- TODO -- we need to pass in the queries and description as well
};

export const QueriesOverTimeRowLabelTooltip: FunctionComponent<QueriesOverTimeRowLabelTooltipProps> = ({
    query,
}: QueriesOverTimeRowLabelTooltipProps) => {
    // TODO: Implement actual tooltip content with query details
    return (
        <div>
            <div className='font-bold'>{query}</div>
            <div className='text-gray-600'>foobar</div>
        </div>
    );
};
