import type { FeatureCollection, GeometryObject } from 'geojson';
import * as topojson from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import z from 'zod';

import { UserFacingError } from '../components/error-display';
import { useQuery } from '../useQuery';

export const mapSourceSchema = z.object({
    type: z.literal('topojson'),
    url: z.string().min(1),
    topologyObjectsKey: z.string().min(1),
});
export type MapSource = z.infer<typeof mapSourceSchema>;

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
    }, [mapSource]);

    if (isLoading) {
        return { isLoading };
    }

    if (error) {
        throw error;
    }

    return { geojsonData, isLoading: false as const };
}

export type GeoJsonFeatureProperties = {
    name: string;
};

async function loadTopojsonMap(
    mapSource: MapSource,
): Promise<FeatureCollection<GeometryObject, GeoJsonFeatureProperties>> {
    const response = await fetch(mapSource.url);
    const topology = (await response.json()) as Topology;
    if (topology?.type !== 'Topology') {
        throw new UserFacingError(
            'Invalid map source',
            `JSON downloaded from ${mapSource.url} does not look like a topojson Topology definition: missing 'type: "Topology"', got '${JSON.stringify(topology).substring(0, 100)}'`,
        );
    }
    const object = topology?.objects[mapSource.topologyObjectsKey] as GeometryCollection<GeoJsonFeatureProperties>;
    if (object?.type !== 'GeometryCollection') {
        throw new UserFacingError(
            'Invalid map source',
            `JSON downloaded from ${mapSource.url} does not have a GeometryCollection at key objects.${mapSource.topologyObjectsKey}, got '${JSON.stringify(topology)?.substring(0, 100)}'`,
        );
    }
    return topojson.feature(topology, object);
}