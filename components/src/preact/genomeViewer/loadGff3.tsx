import { UserFacingError } from '../components/error-display';
import { ColorsRGB, type GraphColor } from '../shared/charts/colors';

export async function loadGff3(gff3Source: string) {
    return await parseGFF3(gff3Source);
}

export type CDSFeature = {
    positions: position[];
    label: string;
    color: GraphColor | undefined;
};

type position = {
    start: number;
    end: number;
};

type CDSMap = {
    [id: string]: CDSFeature;
};

function getAttributes(attributes: string): Map<string, string> {
    const attrPairs = attributes.split(';');
    const attrMap = new Map<string, string>();
    for (const pair of attrPairs) {
        const pair_trimmed = pair.trim();
        const [key, value] = pair_trimmed.split('=');
        attrMap.set(key, value);
    }
    return attrMap;
}

// https://docs.nextstrain.org/projects/nextclade/en/stable/user/input-files/03-genome-annotation.html

function getCDSMap(lines: string[], genome_type: string, geneMap: CDSMap): CDSMap {
    for (const line of lines) {
        if (line.startsWith('#') || line.trim() === '') {
            continue;
        }

        const fields = line.split('\t');
        if (fields.length < 9) {
            continue;
        }

        const [, , type, startStr, endStr, , , , attributes] = fields;

        if (type.toLowerCase() !== genome_type.toLowerCase()) {
            continue;
        }

        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        const attrPairs = getAttributes(attributes);
        const id =
            attrPairs.get('ID') || attrPairs.get('Name') || attrPairs.get('gene') || attrPairs.get('gene_name') || '';
        const label = attrPairs.get('Name') || attrPairs.get('gene') || attrPairs.get('gene_name') || '';
        if (attrPairs.get('Parent')) {
            const parent = attrPairs.get('Parent');
            if (parent && parent in geneMap) {
                delete geneMap[parent];
            }
        }
        if (id in geneMap) {
            geneMap[id].positions.push({ start, end });
        } else {
            geneMap[id] = { positions: [{ start, end }], label, color: undefined };
        }
    }
    return geneMap;
}

function getSortedCDSFeatures(cdsMap: CDSMap): CDSFeature[] {
    const sortedMap: CDSMap = {};

    for (const id in cdsMap) {
        const feature = cdsMap[id];
        const sortedPositions = [...feature.positions].sort((a, b) => a.start - b.start);
        sortedMap[id] = {
            ...feature,
            positions: sortedPositions,
        };
    }
    const cdsFeatures = Object.values(sortedMap);
    cdsFeatures.sort((a, b) => {
        return a.positions[0].start - b.positions[0].start;
    });

    const GraphColorList: GraphColor[] = Object.keys(ColorsRGB) as GraphColor[];
    let colorIndex = cdsFeatures[0].label[0].toUpperCase().charCodeAt(0);
    for (const cdsFeature of cdsFeatures) {
        cdsFeature.color = GraphColorList[colorIndex % GraphColorList.length];
        colorIndex++;
    }
    return cdsFeatures;
}

function getNonOverlappingCDSFeatures(cdsFeatures: CDSFeature[]): CDSFeature[][] {
    const nonOverlappingCDSFeatures: CDSFeature[][] = [];
    for (const cdsFeature of cdsFeatures) {
        let added = false;
        for (const [index, cdsList] of nonOverlappingCDSFeatures.entries()) {
            const lastCds = cdsList[cdsList.length - 1];
            if (cdsFeature.positions[0].start > lastCds.positions[0].end) {
                nonOverlappingCDSFeatures[index].push(cdsFeature);
                added = true;
                break;
            }
        }
        if (!added) {
            nonOverlappingCDSFeatures.push([cdsFeature]);
        }
    }
    return nonOverlappingCDSFeatures;
}

async function parseGFF3(gff3Source: string): Promise<CDSFeature[][]> {
    try {
        new URL(gff3Source);
    } catch (_error) {
        throw new UserFacingError('Invalid gff3 source', `Invalid URL passed to parseGFF3: "${gff3Source}"`);
    }

    const response = await fetch(gff3Source);
    const content = await response.text();
    const lines = content.split('\n');

    const map: CDSMap = {};

    const geneFeatures = getCDSMap(lines, 'gene', map);
    const cdsFeatures = getCDSMap(lines, 'CDS', geneFeatures);

    return getNonOverlappingCDSFeatures(getSortedCDSFeatures(cdsFeatures));
}
