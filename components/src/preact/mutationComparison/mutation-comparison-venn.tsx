import { type ActiveElement, Chart, type ChartConfiguration, type ChartEvent, registerables } from 'chart.js';
import { ArcSlice, extractSets, VennDiagramController } from 'chartjs-chart-venn';
import { Fragment, type FunctionComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import { type SequenceType } from '../../types';
import { DeletionClass, SubstitutionClass } from '../../utils/mutations';
import { AnnotatedMutation } from '../components/annotated-mutation';
import GsChart from '../components/chart';
import { type ProportionInterval } from '../components/proportion-selector';

Chart.register(...registerables, VennDiagramController, ArcSlice);

export interface MutationComparisonVennProps {
    data: Dataset<MutationData>;
    proportionInterval: ProportionInterval;
    maintainAspectRatio: boolean;
    sequenceType: SequenceType;
}

export const MutationComparisonVenn: FunctionComponent<MutationComparisonVennProps> = ({
    data,
    proportionInterval,
    maintainAspectRatio,
    sequenceType,
}) => {
    const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<null | number>(null);

    const sets = useMemo(
        () =>
            extractSets(
                data.content
                    .map((mutationData) => ({
                        displayName: mutationData.displayName,
                        data: mutationData.data.filter(
                            (mutationEntry) =>
                                mutationEntry.proportion >= proportionInterval.min &&
                                mutationEntry.proportion <= proportionInterval.max,
                        ),
                    }))
                    .map((mutationData) => {
                        return {
                            label: mutationData.displayName,
                            values: mutationData.data.map((mutationEntry) => mutationEntry.mutation.toString()),
                        };
                    }),
            ),
        [data, proportionInterval],
    );

    const config: ChartConfiguration = useMemo(
        () => ({
            type: 'venn',
            data: sets,
            options: {
                maintainAspectRatio,
                scales: {
                    x: {
                        ticks: {
                            color: 'black',
                            font: {
                                size: 20,
                            },
                        },
                    },
                    y: {
                        ticks: {
                            color: 'blue',
                            font: {
                                size: 20,
                            },
                        },
                    },
                },
                events: ['click'],
                onClick(_: ChartEvent, elements: ActiveElement[]) {
                    if (elements.length === 0) {
                        setSelectedDatasetIndex(null);
                    }
                },
                backgroundColor: '#f5f5f5',
                animation: false,
                layout: {
                    padding: 30,
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        filter: ({ dataIndex }) => {
                            setSelectedDatasetIndex(dataIndex);
                            return false;
                        },
                    },
                },
            },
        }),
        [maintainAspectRatio, sets],
    );

    if (data.content.length > 5) {
        return <div>Too many datasets to display. Maximum are five. </div>;
    }

    return (
        <div className='h-full flex flex-col'>
            <div className='flex-1'>
                <GsChart configuration={config} />
            </div>
            <p className='flex flex-wrap break-words m-2'>
                <SelectedMutationsDescription
                    selectedDatasetIndex={selectedDatasetIndex}
                    sets={sets}
                    sequenceType={sequenceType}
                />
            </p>
        </div>
    );
};

const noElementSelectedMessage = 'You have no elements selected. Click in the venn diagram to select.';

type SelectedMutationsDescriptionProps = {
    selectedDatasetIndex: number | null;
    sets: ReturnType<typeof extractSets<string>>;
    sequenceType: SequenceType;
};

const SelectedMutationsDescription: FunctionComponent<SelectedMutationsDescriptionProps> = ({
    selectedDatasetIndex,
    sets,
    sequenceType,
}) => {
    if (selectedDatasetIndex === null) {
        return noElementSelectedMessage;
    }

    const values = sets.datasets[0].data[selectedDatasetIndex].values;
    const label = sets.datasets[0].data[selectedDatasetIndex].label;
    return (
        <span>
            {`${label}: `}
            {values
                .map((value) => SubstitutionClass.parse(value) ?? DeletionClass.parse(value))
                .filter((value) => value !== null)
                .map((value, index) => (
                    <Fragment key={value}>
                        {index > 0 && ', '}
                        <AnnotatedMutation mutation={value} sequenceType={sequenceType} />
                    </Fragment>
                ))}
        </span>
    );
};
