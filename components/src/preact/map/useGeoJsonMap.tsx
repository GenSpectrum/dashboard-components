import * as topojson from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';

import { useQuery } from '../useQuery';
import { type MapSource } from './map';

export function useGeoJsonMap(mapSource: MapSource) {
    const {
        data: geojsonData,
        error,
        isLoading,
    } = useQuery(async () => {
        switch (mapSource.type) {
            case 'topojson':
                return await loadTopojsonMap(mapSource);
        }
    }, [mapSource.url]);

    if (isLoading) {
        return { isLoading };
    }

    if (error) {
        throw error;
    }

    return { geojsonData, isLoading: false as const };
}

async function loadTopojsonMap(mapSource: MapSource) {
    const response = await fetch(mapSource.url);
    const topology = (await response.json()) as Topology;
    return topojson.feature(
        topology,
        topology.objects[mapSource.topologyObjectsKey] as GeometryCollection<{
            name: string;
        }>,
    );
}
