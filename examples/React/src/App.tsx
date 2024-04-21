import { useEffect, useState } from 'react';
import '@genspectrum/dashboard-components';
import '@genspectrum/dashboard-components/style.css';

function App() {
    const [location, setLocation] = useState({
        region: 'North America',
        country: 'USA',
    });
    const [dateRange, setDateRange] = useState({
        dateFrom: '2023-06-01',
        dateTo: '2023-09-30',
    });
    const [nextcladePangoLineage, setNextcladePangoLineage] = useState({
        nextcladePangoLineage: 'FL.1.5.1',
    });

    useEffect(() => {
        const handleLocationChange = (event: CustomEvent) => {
            setLocation(event.detail)
        };
        const handleDateRangeChange = (
            event: CustomEvent<{
                dateFrom: string;
                dateTo: string;
            }>,
        ) => {
            setDateRange(event.detail)
        };
        const handleLineageChange = (event: CustomEvent) => {
            console.log(2, event.detail)
            setNextcladePangoLineage(event.detail)
        };

        const locationFilter = document.querySelector('gs-location-filter');
        if (locationFilter) {
            locationFilter.addEventListener('gs-location-changed', handleLocationChange);
        }

        const dateRangeSelector = document.querySelector('gs-date-range-selector');
        if (dateRangeSelector) {
            dateRangeSelector.addEventListener('gs-date-range-changed', handleDateRangeChange);
        }

        const lineageSelector = document.querySelector('gs-text-input');
        if (lineageSelector) {
            lineageSelector.addEventListener('gs-text-input-changed', handleLineageChange);
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
        ...nextcladePangoLineage,
    };

    const numeratorWithDisplayName = {
        ...numerator,
        displayName: nextcladePangoLineage.nextcladePangoLineage,
    };

    const comparisonVariant = {
        displayName: numeratorWithDisplayName.displayName,
        lapisFilter: {
            ...numerator
        },
    }

    const comparisonBaseline = {
        displayName: 'XBB.1',
        lapisFilter: {
            nextcladePangoLineage: 'XBB.1'
        },
    }

    return (
        <gs-app lapis='https://s1.int.genspectrum.org/open'>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
            }}>
                Filters
            </h2>
            <gs-location-filter
                value='North America / USA'
                fields='["region", "country", "division", "location"]'
            ></gs-location-filter>
            <gs-date-range-selector selectedValue='last6Months'></gs-date-range-selector>
            <gs-text-input lapisField='nextcladePangoLineage'></gs-text-input>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
            }}>
                Plots
            </h2>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
            }}>
                <div style={{
                    flex: 1,
                }}>
                    <gs-prevalence-over-time
                        numerator={JSON.stringify(numeratorWithDisplayName)}
                        denominator={JSON.stringify(denominator)}
                        granularity='week'
                        smoothingWindow='0'
                        views='["bubble", "bar", "table"]'
                    ></gs-prevalence-over-time>
                </div>
                <div style={{
                    flex: 1,
                }}>
                    <gs-relative-growth-advantage
                        numerator={JSON.stringify(numerator)}
                        denominator={JSON.stringify(denominator)}
                        views='["line"]'
                        generationTime='7'
                    ></gs-relative-growth-advantage>
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
            }}>
                <div style={{
                    flex: 1,
                }}>
                    <div style={{fontWeight: 'bold'}}>Nucleotide mutations</div>
                    <gs-mutations-component
                        variant={JSON.stringify(numerator)}
                        sequenceType='nucleotide'
                        views='["table", "grid", "insertions"]'
                    ></gs-mutations-component>
                </div>
                <div style={{
                    flex: 1,
                }}>
                    <div style={{fontWeight: 'bold'}}>Amino acid mutations</div>
                    <gs-mutations-component
                        variant={JSON.stringify(numerator)}
                        sequenceType='amino acid'
                        views='["table", "grid", "insertions"]'
                    ></gs-mutations-component>
                </div>
            </div>

            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
            }}>
                Compared to XBB.1
            </h2>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
            }}>
                <div style={{
                    flex: 1,
                }}>
                    <div style={{fontWeight: 'bold'}}>Nucleotide mutations</div>
                    <gs-mutation-comparison-component
                        variants={JSON.stringify([comparisonVariant, comparisonBaseline])}
                        sequenceType='nucleotide'
                        views='["venn", "table"]'
                    ></gs-mutation-comparison-component>
                </div>
                <div style={{
                    flex: 1,
                }}>
                    <div style={{fontWeight: 'bold'}}>Amino acid mutations</div>
                    <gs-mutation-comparison-component
                        variants={JSON.stringify([comparisonVariant, comparisonBaseline])}
                        sequenceType='amino acid'
                        views='["venn", "table"]'
                    ></gs-mutation-comparison-component>
                </div>
            </div>
        </gs-app>
    );
}

export default App;
