import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater } from 'preact/hooks';

import { type QueryFilter } from './getFilteredQueriesOverTimeData';

type QueriesOverTimeFilterProps = {
    value: QueryFilter;
    setFilterValue: Dispatch<StateUpdater<QueryFilter>>;
};

export const QueriesOverTimeFilter: FunctionComponent<QueriesOverTimeFilterProps> = ({ value, setFilterValue }) => {
    return (
        <input
            type='text'
            placeholder='Filter queries...'
            className='input input-xs input-bordered w-40'
            value={value.textFilter}
            onInput={(e) =>
                setFilterValue({
                    textFilter: (e.target as HTMLInputElement).value,
                })
            }
        />
    );
};
