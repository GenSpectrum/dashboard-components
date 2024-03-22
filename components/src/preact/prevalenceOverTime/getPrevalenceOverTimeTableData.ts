import { TemporalGranularity } from '../../types';
import { PrevalenceOverTimeData } from '../../query/queryPrevalenceOverTime';

export function getPrevalenceOverTimeTableData(data: PrevalenceOverTimeData, granularity: TemporalGranularity) {
    return data[0].content.map((row, rowNumber) => {
        const otherColumns = data
            .map((dataset) => ({
                [`${dataset.displayName} prevalence`]: dataset.content[rowNumber].prevalence.toFixed(4),
                [`${dataset.displayName} count`]: dataset.content[rowNumber].count,
            }))
            .reduce((acc, val) => ({ ...acc, ...val }), {});

        return {
            [granularity]: row.dateRange?.toString() ?? 'Unknown',
            ...otherColumns,
        };
    });
}
