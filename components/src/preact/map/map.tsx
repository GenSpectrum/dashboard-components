import { Chart, type ChartConfiguration } from 'chart.js';
import {
    ChoroplethController,
    ColorScale,
    type Feature,
    GeoFeature,
    ProjectionScale,
    topojson,
} from 'chartjs-chart-geo';
import type { FunctionComponent } from 'preact';
import countries50m from 'world-atlas/countries-50m.json';
import germany from './germany.json';
import germany2 from './germany2.json';

import GsChart from '../components/chart';

export type MapProps = {};

Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

export const Map: FunctionComponent<MapProps> = ({}) => {
    // const countries: Feature = topojson.feature(germany, germany.objects.states).features;
    const countries: Feature = topojson.feature(germany2, germany2.objects.deu).features;
    // const countries: Feature = topojson.feature(countries50m, countries50m.objects.countries).features;

    console.log(countries);

    const data: ChartConfiguration<'choropleth'>['data'] = {
        labels: countries.map((d) => d.properties.name),
        datasets: [
            {
                label: 'Countries',
                data: countries.map((d) => ({
                    feature: d,
                    value: Math.random(),
                })),
            },
        ],
    };

    const config: ChartConfiguration<'choropleth'> = {
        type: 'choropleth',
        data,
        options: {
            showOutline: true,
            showGraticule: true,
            scales: {
                projection: {
                    axis: 'x',
                    projection: 'mercator',
                    // offset: true,
                    // min: 100,
                    // max: 101,
                    projectionOffset: [0, 1500],
                    projectionScale: 10,
                },
            },
            onClick: (evt, elems) => {
                console.log(elems.map((elem) => elem.element.feature.properties.name));
            },
        },
    };

    return <GsChart configuration={config} />;
};
