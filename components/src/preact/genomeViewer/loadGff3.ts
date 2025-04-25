import { UserFacingError } from '../components/error-display';
import { ColorsRGB, type GraphColor } from '../shared/charts/colors';

export type CDSFeature = {
    positions: Position[];
    label: string;
    color: GraphColor;
};

type Position = {
    start: number;
    end: number;
};

type CDSMap = {
    [id: string]: { positions: Position[]; label: string };
};

export async function loadGff3(gff3Source: string, genomeLength: number | undefined) {
    try {
        new URL(gff3Source);
    } catch (_error) {
        throw new UserFacingError('Invalid gff3 source', `Invalid URL passed to parseGFF3: "${gff3Source}"`);
    }

    const response = await fetch(gff3Source);
    const content = await response.text();
    if (!genomeLength) {
        genomeLength = loadGenomeLength(content);
    }
    return { features: parseGFF3(content), length: genomeLength };
}

export function parseGFF3(content: string): CDSFeature[][] {
    /**
     * Reads in CDS from GFF3 according to nextclade rules:
     * https://docs.nextstrain.org/projects/nextclade/en/stable/user/input-files/03-genome-annotation.html
     * Read in both gene and CDS features
     * If a CDS feature has a gene feature as a parent, remove the gene feature
     * Split the CDS features into non-overlapping features
     */
    const lines = content.split('\n');

    const map: CDSMap = {};

    const geneFeatures = getCDSMap(lines, 'gene', map);
    const cdsFeatures = getCDSMap(lines, 'CDS', geneFeatures);

    return getNonOverlappingCDSFeatures(getSortedCDSFeatures(cdsFeatures));
}

function getAttributes(attributes: string): Map<string, string> {
    const attrPairs = attributes.split(';');
    const attrMap = new Map<string, string>();
    for (const pair of attrPairs) {
        const pairTrimmed = pair.trim();
        const [key, value] = pairTrimmed.split('=');
        attrMap.set(key, value);
    }
    return attrMap;
}

function getCDSMap(lines: string[], genome_type: string, geneMap: CDSMap): CDSMap {
    for (const line of lines) {
        if (line.startsWith('#') || line.trim() === '') {
            continue;
        }

        const fields = line.split('\t');
        if (fields.length < 9) {
            throw new UserFacingError('Invalid gff3 source', `Gff3 line has less than 9 fields: "${line}"`);
        }

        const [, , type, startStr, endStr, , , , attributes] = fields;

        if (type.toLowerCase() !== genome_type.toLowerCase()) {
            continue;
        }

        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end)) {
            throw new UserFacingError('Invalid gff3 source', `Invalid start or end position: "${line}"`);
        }

        const attrPairs = getAttributes(attributes);
        const label = attrPairs.get('Name') || attrPairs.get('gene') || attrPairs.get('gene_name');
        if (!label) {
            throw new UserFacingError(
                'Invalid gff3 source',
                `No label found for feature: "${line}", must contain label in Name, gene, or gene_name attribute`,
            );
        }
        const id = attrPairs.get('ID') || label;
        if (attrPairs.get('Parent')) {
            const parent = attrPairs.get('Parent');
            if (parent && parent in geneMap) {
                delete geneMap[parent];
            }
        }
        if (id in geneMap) {
            geneMap[id].positions.push({ start, end });
        } else {
            geneMap[id] = { positions: [{ start, end }], label };
        }
    }
    return geneMap;
}

function getSortedCDSFeatures(cdsMap: CDSMap): CDSFeature[] {
    const mapValues = Object.values(cdsMap);

    mapValues.forEach((feature) => {
        feature.positions.sort((a, b) => a.start - b.start);
    });

    mapValues.sort((a, b) => {
        return a.positions[0].start - b.positions[0].start;
    });

    const GraphColorList = Object.keys(ColorsRGB) as GraphColor[];
    const colorIndex = mapValues[0].label[0].toUpperCase().charCodeAt(0);

    const cdsFeatures: CDSFeature[] = mapValues.map((value, index) => ({
        positions: value.positions,
        label: value.label,
        color: GraphColorList[(colorIndex + index) % GraphColorList.length],
    }));

    return cdsFeatures;
}

function getNonOverlappingCDSFeatures(cdsFeatures: CDSFeature[]): CDSFeature[][] {
    const nonOverlappingCDSFeatures: CDSFeature[][] = [];
    for (const cdsFeature of cdsFeatures) {
        let added = false;
        for (const cdsList of nonOverlappingCDSFeatures) {
            const lastCds = cdsList[cdsList.length - 1];
            if (cdsFeature.positions[0].start > lastCds.positions[lastCds.positions.length - 1].end) {
                cdsList.push(cdsFeature);
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

export function loadGenomeLength(content: string) {
    const lines = content.split('\n');
    for (const line of lines) {
        if (!line.startsWith('#')) {
            continue;
        }
        const fields = line.split(' ');
        if (fields[0] === '##sequence-region') {
            if (fields.length < 3) {
                throw new UserFacingError('Invalid gff3 source', `No length found in sequence-region: "${line}"`);
            }
            const start = fields.at(-2);
            const end = fields.at(-1);
            const length = parseInt(end!, 10) - parseInt(start!, 10) + 1;
            if (isNaN(length)) {
                throw new UserFacingError('Invalid gff3 source', `No length found in sequence-region: "${line}"`);
            }
            return length;
        }
    }
    throw new UserFacingError('Invalid gff3 source', `No length found in sequence-region`);
}
