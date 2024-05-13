import { type ActiveElement, Chart, type ChartConfiguration, type ChartEvent, registerables } from 'chart.js';
import { ArcSlice, extractSets, VennDiagramController } from 'chartjs-chart-venn';
import { type FunctionComponent } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import GsChart from '../components/chart';
import { type ProportionInterval } from '../components/proportion-selector';

Chart.register(...registerables, VennDiagramController, ArcSlice);

export interface MutationComparisonVennProps {
    data: Dataset<MutationData>;
    proportionInterval: ProportionInterval;
}

export const MutationComparisonVenn: FunctionComponent<MutationComparisonVennProps> = ({
    data,
    proportionInterval,
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const noElementSelectedMessage = 'You have no elements selected. Click in the venn diagram to select.';
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

    useEffect(() => {
        if (divRef.current === null) {
            return;
        }
        if (selectedDatasetIndex === null) {
            divRef.current.innerText = noElementSelectedMessage;
            return;
        }

        const values = sets.datasets[0].data[selectedDatasetIndex].values;
        const label = sets.datasets[0].data[selectedDatasetIndex].label;
        divRef.current!.innerText = `${label}: ${values.join(', ')}` || '';
    }, [divRef, selectedDatasetIndex, sets]);

    const config: ChartConfiguration = useMemo(
        () => ({
            type: 'venn',
            data: sets,
            options: {
                maintainAspectRatio: false,
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
        [sets],
    );

    if (data.content.length > 5) {
        return <div>Too many variants to display. Maximum are five. </div>;
    }

    return (
        <div className='h-full flex flex-col'>
            <div className='flex-1'>
                <GsChart configuration={config} />
            </div>
            <div class='flex flex-wrap break-words m-2' ref={divRef} />
        </div>
    );
};
