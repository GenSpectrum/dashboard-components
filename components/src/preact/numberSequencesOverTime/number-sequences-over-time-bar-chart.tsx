import { Chart, type ChartConfiguration, type ChartDataset, registerables } from 'chart.js';
import { useMemo } from 'preact/hooks';

import { getNumberOfSequencesOverTimeTableData } from './getNumberOfSequencesOverTimeTableData';
import { type NumberOfSequencesDatasets } from '../../query/queryNumberOfSequencesOverTime';
import GsChart from '../components/chart';
import { singleGraphColorRGBAById } from '../shared/charts/colors';

interface NumberSequencesOverBarChartProps {
    data: NumberOfSequencesDatasets;
}

Chart.register(...registerables);

export const NumberSequencesOverTimeBarChart = ({ data }: NumberSequencesOverBarChartProps) => {
    const config: ChartConfiguration = useMemo(
        () => ({
            type: 'bar',
            data: {
                datasets: getDatasets(data),
            },
            options: {
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                },
            },
        }),
        [data],
    );

    return <GsChart configuration={config} />;
};

const getDatasets = (data: NumberOfSequencesDatasets) => {
    const tableData = getNumberOfSequencesOverTimeTableData(data, 'date');

    return data.map(
        ({ displayName }, index) =>
            ({
                borderWidth: 1,
                label: displayName,
                backgroundColor: singleGraphColorRGBAById(index, 0.3),
                borderColor: singleGraphColorRGBAById(index),
                data: tableData.map((row) => ({
                    x: row.date,
                    y: row[displayName],
                })),
            }) as ChartDataset<'bar', { x: string; y: number }[]>,
    );
};
