import { type ActiveElement, Chart, type ChartConfiguration, type ChartEvent, registerables } from 'chart.js';
import { ArcSlice, extractSets, VennDiagramController } from 'chartjs-chart-venn';
import { type FunctionComponent } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';

import { type MutationData } from './queryMutationData';
import { type Dataset } from '../../operator/Dataset';
import GsChart from '../components/chart';

Chart.register(...registerables, VennDiagramController, ArcSlice);

export interface MutationComparisonVennProps {
    data: Dataset<MutationData>;
}

export const MutationComparisonVenn: FunctionComponent<MutationComparisonVennProps> = ({ data }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const noElementSelectedMessage = 'You have no elements selected. Click in the venn diagram to select.';
    useEffect(() => {
        if (divRef.current === null) {
            return;
        }
        divRef.current.innerText = noElementSelectedMessage;
    }, [divRef]);

    const sets = useMemo(
        () =>
            extractSets(
                data.content
                    .map((mutationData) => {
                        return {
                            ...mutationData,
                            data: mutationData.data,
                        };
                    })
                    .map((mutationData) => {
                        return {
                            label: mutationData.displayName,
                            values: mutationData.data.map((mutationEntry) => mutationEntry.mutation.toString()),
                        };
                    }),
            ),
        [data],
    );

    if (data.content.length > 5) {
        return <div>Too many variants to display. Maximum are five. </div>;
    }

    const config: ChartConfiguration = {
        type: 'venn',
        data: sets,
        options: {
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
                    divRef.current!.innerText = noElementSelectedMessage;
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
                    filter: (tooltipItem: { dataset: { data: { values: string[] }[] }; dataIndex: number }) => {
                        const values = tooltipItem.dataset.data[tooltipItem.dataIndex].values;

                        divRef.current!.innerText = `Mutations: ${values.join(', ')}` || '';
                        return false;
                    },
                },
            },
        },
    };

    return (
        <>
            <GsChart configuration={config} />
            <div class='flex flex-wrap break-words m-2' ref={divRef} />
        </>
    );
};
