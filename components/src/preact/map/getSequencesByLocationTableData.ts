import type { AggregateData } from '../../query/queryAggregateData';

export function getSequencesByLocationTableData(
    locationData: AggregateData,
    unmatchedLocations: string[] | undefined,
    lapisLocationField: string,
) {
    if (unmatchedLocations === undefined) {
        return locationData;
    }

    return locationData.map((row) => ({
        ...row,
        isShownOnMap: `${isShownOnMap(row, unmatchedLocations, lapisLocationField)}`,
    }));
}

function isShownOnMap(row: AggregateData[number], unmatchedLocations: string[], lapisLocationField: string) {
    const locationValue = row[lapisLocationField];
    if (locationValue === null) {
        return false;
    }

    return !unmatchedLocations.includes(locationValue as string);
}
