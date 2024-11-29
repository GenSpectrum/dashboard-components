import { ActiveElement, Chart, type ChartConfiguration, ChartEvent, registerables } from 'chart.js';
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
import { useEffect, useRef } from 'preact/hooks';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapProps = {};

Chart.register(...registerables, ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

export const Map: FunctionComponent<MapProps> = ({}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const countries: Feature = topojson.feature(germany2, germany2.objects.deu).features;

        const map = L.map(ref.current, {
            scrollWheelZoom: false,
            zoomControl: false,
            keyboard: false,
            dragging: false,
        });
        map.setView([51.1657, 10.4515], 5);

        // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
        //     foo: 'bar',
        //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // }).addTo(map);
        // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        L.geoJson(countries).bindPopup('asdaf').addTo(map);

        console.log('ok');
    }, [ref]);

    return (
        <div className='border-2 p-4'>
            <div ref={ref} className='w-[800px] h-[600px]' />
        </div>
    );
};
