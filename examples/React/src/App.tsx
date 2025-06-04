import {useEffect, useRef, useState} from 'react';
import {
    DateRangeOption,
    dateRangeOptionPresets,
    gsEventNames,
    LocationChangedEvent
} from '@genspectrum/dashboard-components/util';
import '@genspectrum/dashboard-components/components';


function App() {
    const locationFilterRef = useRef<HTMLElement>();
    const dateRangeFilterRef = useRef<HTMLElement>();

    const [location, setLocation] = useState<Record<string, string | undefined>>({
        region: undefined,
        country: undefined,
        division: undefined,
    });
    const [dateRange, setDateRange] = useState<{ dateFrom: string | undefined; dateTo: string | undefined }>({
        dateFrom: undefined,
        dateTo: undefined,
    });

    useEffect(() => {
        const locationFilter = locationFilterRef.current;
        if (!locationFilter) {
            return;
        }

        const handleLocationChange = (event: LocationChangedEvent) => setLocation(event.detail);

        locationFilter.addEventListener(gsEventNames.locationChanged, handleLocationChange);

        return () => {
            locationFilter.removeEventListener(gsEventNames.locationChanged, handleLocationChange);
        };
    }, []);

    useEffect(() => {
        const dateRangeFilter = dateRangeFilterRef.current
        if (!dateRangeFilter) {
            return;
        }

        const handleDateRangeChange = (
            event: Event,
        ) => {
            const customEvent = event as CustomEvent<{ dateFrom: string | undefined; dateTo: string | undefined }>;
            setDateRange(customEvent.detail);
        };

        dateRangeFilter.addEventListener(gsEventNames.dateRangeFilterChanged, handleDateRangeChange);

        return () => {
            dateRangeFilter.removeEventListener('gs-date-range-filter-changed', handleDateRangeChange);
        };
    }, []);

    const denominator = {
        ...dateRange,
        ...location,
    };

    const numerator = {
        displayName: 'My variant',
        lapisFilter: {
            ...denominator,
            pangoLineage: 'B.1.1.7*',
        },
    };

    const dataRangeOptions = [
        dateRangeOptionPresets.allTimes,
        dateRangeOptionPresets.last6Months,
        dateRangeOptionPresets.lastMonth,
        {label: '2020', dateFrom: '2020-01-01', dateTo: '2020-12-31'},
        {label: '2021', dateFrom: '2021-01-01', dateTo: '2021-12-31'},
        {label: '2022', dateFrom: '2022-01-01', dateTo: '2022-12-31'},
    ] satisfies DateRangeOption[];

    return (
        <gs-app lapis='https://lapis.cov-spectrum.org/open/v2/'>
            <gs-location-filter
                fields='["region", "country", "division", "location"]'
                placeholderText='Enter a location'
                ref={locationFilterRef}
                lapisFilter={JSON.stringify(location)}
                value={JSON.stringify(location)}
            ></gs-location-filter>
            <gs-date-range-filter
                dateRangeOptions={JSON.stringify(dataRangeOptions)}
                lapisDateField='date'
                ref={dateRangeFilterRef}
            ></gs-date-range-filter>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <div>
                    <h1>Prevalence over time</h1>
                    <gs-prevalence-over-time
                        numeratorFilters={JSON.stringify([numerator])}
                        denominatorFilter={JSON.stringify(denominator)}
                        lapisDateField='date'
                        granularity='day'
                        smoothingWindow='7'
                        views='["line", "table"]'
                        width='800px'
                        height='300px'
                    ></gs-prevalence-over-time>
                </div>
                <div style={{height: '300px', width: '1000px'}}>
                    <h1>Prevalence over time</h1>
                    <gs-prevalence-over-time
                        numeratorFilters={JSON.stringify([numerator])}
                        denominatorFilter={JSON.stringify(denominator)}
                        lapisDateField='date'
                        granularity='day'
                        smoothingWindow='7'
                        views='["line", "table"]'
                        width='80%'
                        height='100%'
                    ></gs-prevalence-over-time>
                </div>
            </div>
            <h1>Prevalence over time</h1>
            <div>
                <gs-prevalence-over-time
                    numeratorFilters={JSON.stringify([numerator])}
                    denominatorFilter={JSON.stringify(denominator)}
                    lapisDateField='date'
                    granularity='day'
                    smoothingWindow='7'
                    views='["line", "table"]'
                ></gs-prevalence-over-time>
            </div>
            <h1>Relative Growth Advantage</h1>
            <gs-relative-growth-advantage
                numeratorFilter={JSON.stringify(numerator.lapisFilter)}
                denominatorFilter={JSON.stringify(denominator)}
                lapisDateField='date'
                generationTime='7'
                views='["line"]'
                width='100%'
                height='700px'
            ></gs-relative-growth-advantage>
            <gs-mutations-over-time
                lapisFilter={JSON.stringify(numerator.lapisFilter)}
                sequenceType='nucleotide'
                views='["grid"]'
                width='100%'
                height='700px'
                granularity='week'
                lapisDateField='date'
            ></gs-mutations-over-time>
        </gs-app>
    );
}

export default App;
