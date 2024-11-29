import { Chart, registerables } from 'chart.js';
import { ChoroplethController, ColorScale, GeoFeature, ProjectionScale, topojson } from 'chartjs-chart-geo';
import L from 'leaflet';
import type { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { type GeometryCollection, type Topology } from 'topojson-specification';

import germany from './germany.json';
import uk from './uk.topo.json';
import us from './us.topo.json';
import { formatProportion } from '../shared/table/formatProportion';

import 'leaflet/dist/leaflet.css';

export type MapProps = { country: keyof typeof countryConfig };

Chart.register(...registerables, ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

function getColor(d: number) {
    return d > 1.0
        ? '#800026'
        : d > 0.5
          ? '#BD0026'
          : d > 0.2
            ? '#E31A1C'
            : d > 0.1
              ? '#FC4E2A'
              : d > 0.05
                ? '#FD8D3C'
                : d > 0.02
                  ? '#FEB24C'
                  : d > 0.01
                    ? '#FED976'
                    : '#FFEDA0';
}

type GeoColl = GeometryCollection<{
    name: string;
}>;

const countryConfig = {
    de: [germany, germany.objects.states, [51.1657, 10.4515], 6],
    uk: [uk, uk.objects.subunits, [55.3781, -5], 5],
    us: [us, us.objects.usa, [40, -100], 4],
} as const;

export const Map: FunctionComponent<MapProps> = ({ country }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const [topoJson, geoCollection, offset, zoom] =
            country in countryConfig ? countryConfig[country] : countryConfig.us;

        const feature1 = topojson.feature(topoJson as Topology, geoCollection as GeoColl);

        const countries = feature1.features.map((feature) => ({
            ...feature,
            properties: {
                ...feature.properties,
                value: Math.random(),
            },
        }));

        const map = L.map(ref.current, {
            scrollWheelZoom: false,
            zoomControl: false,
            keyboard: false,
            dragging: false,
        });
        map.setView(offset, zoom);

        L.geoJson(countries, {
            style: (feature) => ({
                fillColor: getColor(feature?.properties.value),
                fillOpacity: 0.5,
                color: 'black',
                weight: 1,
            }),
        })
            .bindTooltip((a) => {
                return `${a.feature.properties.name}: ${formatProportion(a.feature.properties.value)}`;
            })
            .addTo(map);

        return () => {
            map.remove();
        };
    }, [ref, country]);

    return (
        <div className='border-2 p-4'>
            <div ref={ref} className='w-[800px] h-[600px] bg-white' />
        </div>
    );
};
