import { useEffect, useState } from 'react';
import '@genspectrum/dashboard-components';
import '@genspectrum/dashboard-components/style.css';

function App() {
    const [location, setLocation] = useState({
        region: 'Europe',
        country: 'Switzerland',
    });
    const [dateRange, setDateRange] = useState({
        dateFrom: '2021-01-01',
        dateTo: '2022-01-01',
    });

    useEffect(() => {
        const handleLocationChange = (event: CustomEvent) => setLocation(event.detail);
        const handleDateRangeChange = (
            event: CustomEvent<{
                dateFrom: string;
                dateTo: string;
            }>,
        ) => setDateRange(event.detail);

        const locationFilter = document.querySelector('gs-location-filter');
        if (locationFilter) {
            locationFilter.addEventListener('gs-location-changed', handleLocationChange);
        }

        const dateRangeSelector = document.querySelector('gs-date-range-selector');
        if (dateRangeSelector) {
            dateRangeSelector.addEventListener('gs-date-range-changed', handleDateRangeChange);
        }

        return () => {
            if (locationFilter) {
                locationFilter.removeEventListener('gs-location-changed', handleLocationChange);
            }
            if (dateRangeSelector) {
                dateRangeSelector.removeEventListener('gs-date-range-changed', handleDateRangeChange);
            }
        };
    }, []);

    const denominator = {
        ...dateRange,
        ...location,
    };

    const numerator = {
        ...denominator,
        displayName: 'My variant',
        pangoLineage: 'B.1.1.7',
    };

    return (
        <gs-app lapis='https://s1.int.genspectrum.org/open'>
            <gs-location-filter
                initialValue='Europe / Switzerland'
                fields='["region", "country", "division", "location"]'
            ></gs-location-filter>
            <gs-date-range-selector initialValue='last6Months'></gs-date-range-selector>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <gs-prevalence-over-time
                    numerator={JSON.stringify(numerator)}
                    denominator={JSON.stringify(denominator)}
                    granularity='day'
                    smoothingWindow='7'
                    views='["line", "table"]'
                    size={JSON.stringify({ height: '300px', width: '800px' })}
                ></gs-prevalence-over-time>
                <div style={{ height: '300px', width: '1000px' }}>
                    <gs-prevalence-over-time
                        numerator={JSON.stringify(numerator)}
                        denominator={JSON.stringify(denominator)}
                        granularity='day'
                        smoothingWindow='7'
                        views='["line", "table"]'
                        size={JSON.stringify({ height: '100%', width: '80%' })}
                    ></gs-prevalence-over-time>
                </div>
            </div>
            <div>
                <gs-prevalence-over-time
                    numerator={JSON.stringify(numerator)}
                    denominator={JSON.stringify(denominator)}
                    granularity='day'
                    smoothingWindow='7'
                    views='["line", "table"]'
                ></gs-prevalence-over-time>
            </div>
        </gs-app>
    );
}

export default App;
