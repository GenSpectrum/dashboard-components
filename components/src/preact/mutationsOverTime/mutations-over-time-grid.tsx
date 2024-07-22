import { Fragment, type FunctionComponent } from 'preact';

import {
    type MutationOverTimeDataGroupedByMutation,
    type MutationOverTimeMutationValue,
} from '../../query/queryMutationsOverTime';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { compareTemporal, type Temporal } from '../../utils/temporal';
import { UserFacingError } from '../components/error-display';
import { singleGraphColorRGBByName } from '../shared/charts/colors';
import { formatProportion } from '../shared/table/formatProportion';

export interface MutationsOverTimeGridProps {
    data: MutationOverTimeDataGroupedByMutation;
}

const MAX_NUMBER_OF_GRID_ROWS = 100;

const MutationsOverTimeGrid: FunctionComponent<MutationsOverTimeGridProps> = ({ data }) => {
    const mutations = data.getFirstAxisKeys();
    if (mutations.length > MAX_NUMBER_OF_GRID_ROWS) {
        throw new UserFacingError(
            'Too many mutations',
            `The dataset contains ${mutations.length} mutations. ` +
                `Please adapt the filters to reduce the number to below ${MAX_NUMBER_OF_GRID_ROWS}.`,
        );
    }

    const dates = data.getSecondAxisKeys().sort((a, b) => compareTemporal(a, b));

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${mutations.length}, 24px)`,
                gridTemplateColumns: `8rem repeat(${dates.length}, minmax(1.5rem, 1fr))`,
            }}
        >
            {mutations.map((mutation, i) => {
                return (
                    <Fragment key={`fragment-${mutation.toString()}`}>
                        <div
                            key={`mutation-${mutation.toString()}`}
                            style={{ gridRowStart: i + 1, gridColumnStart: 1 }}
                        >
                            <MutationCell mutation={mutation} />
                        </div>
                        {dates.map((date, j) => {
                            const value = data.get(mutation, date) ?? 0;
                            return (
                                <div
                                    style={{ gridRowStart: i + 1, gridColumnStart: j + 2 }}
                                    key={`${mutation.toString()}-${date.toString()}`}
                                >
                                    <ProportionCell value={value} date={date} mutation={mutation} />
                                </div>
                            );
                        })}
                    </Fragment>
                );
            })}
        </div>
    );
};

const ProportionCell: FunctionComponent<{
    value: MutationOverTimeMutationValue;
    date: Temporal;
    mutation: Substitution | Deletion;
}> = ({ value }) => {
    // TODO(#353): Add tooltip with date, mutation and proportion
    return (
        <>
            <div className={'py-1'}>
                <div
                    style={{ backgroundColor: backgroundColor(value), color: textColor(value) }}
                    className='text-center hover:font-bold text-xs'
                >
                    {formatProportion(value, 0)}
                </div>
            </div>
        </>
    );
};

const backgroundColor = (proportion: number) => {
    // TODO(#353): Make minAlpha and maxAlpha configurable
    const minAlpha = 0.0;
    const maxAlpha = 1;

    const alpha = minAlpha + (maxAlpha - minAlpha) * proportion;
    return singleGraphColorRGBByName('indigo', alpha);
};

const textColor = (proportion: number) => {
    return proportion > 0.5 ? 'white' : 'black';
};

const MutationCell: FunctionComponent<{ mutation: Substitution | Deletion }> = ({ mutation }) => {
    return <div className='text-center'>{mutation.toString()}</div>;
};

export default MutationsOverTimeGrid;
