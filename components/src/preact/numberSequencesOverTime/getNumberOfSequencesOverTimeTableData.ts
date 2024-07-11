import type { NumberOfSequencesDatasets } from '../../query/queryNumberOfSequencesOverTime';
import type { TemporalGranularity } from '../../types';
import { generateAllInRange, getMinMaxTemporal, type Temporal } from '../../utils/temporal';

export const getNumberOfSequencesOverTimeTableData = (
    data: NumberOfSequencesDatasets,
    granularity: TemporalGranularity,
) => {
    const datasetsWithCountByDate = data.map(({ displayName, content }) => ({
        displayName,
        content: new Map(content.map((datum) => [datum.dateRange?.toString(), datum])),
    }));

    const allDateRangesThatOccurInData = datasetsWithCountByDate
        .map(({ content }) => [...content.values()].map((datum) => datum.dateRange))
        .reduce((acc, keys) => new Set([...acc, ...keys]), new Set<Temporal | null>());

    const minMax = getMinMaxTemporal(allDateRangesThatOccurInData);
    if (minMax === null) {
        return [];
    }

    const allDateRanges: (Temporal | null)[] = generateAllInRange(...minMax);

    if (allDateRangesThatOccurInData.has(null)) {
        allDateRanges.unshift(null);
    }

    return allDateRanges.map((dateRange) => {
        return datasetsWithCountByDate.reduce(
            (acc, dataset) => ({
                ...acc,
                [dataset.displayName]: dataset.content.get(dateRange?.toString())?.count ?? 0,
            }),
            { [granularity]: dateRange?.toString() ?? 'Unknown' } as Record<string, number | string>,
        );
    });
};
