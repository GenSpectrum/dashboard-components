import { BarController, Chart, type ChartConfiguration, type ChartDataset, registerables } from 'chart.js';
import { type FunctionComponent } from 'preact';

import type { AggregateData } from '../../query/queryAggregateData';
import GsChart from '../components/chart';
import { NoDataDisplay } from '../components/no-data-display';
import { LogitScale } from '../shared/charts/LogitScale';
import { singleGraphColorRGBAById } from '../shared/charts/colors';
import { formatProportion } from '../shared/table/formatProportion';

interface AggregateBarChartProps {
    data: AggregateData;
    fields: string[];
}

Chart.register(...registerables, LogitScale, BarController);

type DataPoint = {
    y: string;
    x: number;
    proportion: number;
};

export const AggregateBarChart: FunctionComponent<AggregateBarChartProps> = ({ data, fields }) => {
    if (data.length === 0) {
        return <NoDataDisplay />;
    }

    if (fields.length === 0) {
        return <NoDataDisplay message='TODO: fields.length === 0' />;
    }

    if (fields.length > 2) {
        return <NoDataDisplay message='TODO: fields.length > 2' />;
    }

    const config: ChartConfiguration<'bar', DataPoint[]> = {
        type: 'bar',
        data: {
            datasets: getDatasets(fields, data),
        },
        options: {
            maintainAspectRatio: false,
            animation: false,
            indexAxis: 'y',
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    mode: 'y',
                    callbacks: {
                        label: (context) => {
                            const { x, proportion } = context.dataset.data[context.dataIndex] as unknown as DataPoint;
                            // TODO: show proportion? Maybe misleading, because it's global and not per bar
                            return fields.length === 1
                                ? `${x}`
                                : `${context.dataset.label}: ${x} (${formatProportion(proportion)}})`;
                        },
                    },
                },
            },
        },
    };

    return <GsChart configuration={config} />;
};

function getDatasets(
    fields: string[],
    data: (Record<string, string | number | boolean | null> & {
        count: number;
        proportion: number;
    })[],
): ChartDataset<'bar', DataPoint[]>[] {
    if (fields.length === 1) {
        return [
            {
                borderWidth: 1,
                backgroundColor: singleGraphColorRGBAById(0, 0.3),
                borderColor: singleGraphColorRGBAById(0),
                data: data.map((row) => ({
                    y: row[fields[0]] as string,
                    x: row.count,
                    proportion: row.proportion,
                })),
            },
        ];
    }

    const map = new Map<string, DataPoint[]>();

    for (const row of data) {
        if (row[fields[0]] === null) {
            continue;
        }

        const secondaryKey = (row[fields[1]] as string | null) ?? 'Unknown';
        if (!map.has(secondaryKey)) {
            map.set(secondaryKey, []);
        }
        map.get(secondaryKey)?.push({
            // TODO: show null?
            y: (row[fields[0]] as string | null) ?? 'Unknown',
            x: row.count,
            proportion: row.proportion,
        });
    }

    return Array.from(map.entries()).map(([key, value], index) => {
        return {
            borderWidth: 1,
            backgroundColor: singleGraphColorRGBAById(index, 0.3),
            borderColor: singleGraphColorRGBAById(index),
            label: key,
            data: value,
        };
    });
}
