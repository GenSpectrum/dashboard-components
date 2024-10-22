import type { NumberOfSequencesDatasets } from '../../query/queryNumberOfSequencesOverTime';
import { generateAllInRange, getMinMaxTemporal, type TemporalClass } from '../../utils/temporalClass';

type TableRow<DateRangeKey extends string> = { [K in DateRangeKey]: string } & { [key: string]: number };

export const getNumberOfSequencesOverTimeTableData = <DateRangeKey extends string>(
    data: NumberOfSequencesDatasets,
    dateRangeKey: DateRangeKey,
) => {
    const datasetsWithCountByDate = data.map(({ displayName, content }) => ({
        displayName,
        content: new Map(content.map((datum) => [datum.dateRange?.toString(), datum])),
    }));

    const allDateRangesThatOccurInData = datasetsWithCountByDate
        .map(({ content }) => [...content.values()].map((datum) => datum.dateRange))
        .reduce((acc, keys) => new Set([...acc, ...keys]), new Set<TemporalClass | null>());

    const minMax = getMinMaxTemporal(allDateRangesThatOccurInData);
    if (minMax === null) {
        return [];
    }

    const allDateRanges: (TemporalClass | null)[] = generateAllInRange(minMax.min, minMax.max);

    if (allDateRangesThatOccurInData.has(null)) {
        allDateRanges.unshift(null);
    }

    return allDateRanges.map((dateRange) => {
        return datasetsWithCountByDate.reduce(
            (acc, dataset) => ({
                ...acc,
                [dataset.displayName]: dataset.content.get(dateRange?.toString())?.count ?? 0,
            }),
            { [dateRangeKey]: dateRange?.toString() ?? 'Unknown' } as TableRow<DateRangeKey>,
        );
    });
};
