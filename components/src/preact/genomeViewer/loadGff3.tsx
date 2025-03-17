import { ColorsRGB, type GraphColor } from '../shared/charts/colors';

export async function loadGff3(gff3Source: string) {
    return await parseGFF3(gff3Source);
}

export type CDSFeature = {
    start: number;
    end: number;
    label: string;
    color: GraphColor;
};

function getCDS(lines: string[], cdsFeatures: CDSFeature[], genome_type: string) {
    let colorIndex = 0;
    for (const line of lines) {
        if (line.startsWith('#') || line.trim() === '') {
            continue;
        }

        const fields = line.split('\t');
        if (fields.length < 9) {
            continue;
        }

        const [, , type, startStr, endStr, , , , attributes] = fields;

        if (type !== genome_type) {
            continue;
        }

        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        let label = '';
        const attrPairs = attributes.split(';');
        for (const pair of attrPairs) {
            const pair_trimmed = pair.trim();
            if (pair_trimmed.startsWith('gene=')) {
                label = pair_trimmed.replace('gene=', '');
                break;
            } else if (pair_trimmed.startsWith('Name=')) {
                label = pair_trimmed.replace('Name=', '');
            } else if (pair_trimmed.startsWith('gene_name=')) {
                label = pair_trimmed.replace('gene_name=', '');
            }
        }

        const GraphColorList: GraphColor[] = Object.keys(ColorsRGB) as GraphColor[];
        const color: GraphColor = GraphColorList[colorIndex % GraphColorList.length];
        colorIndex++;

        cdsFeatures.push({ start, end, label, color });
    }
    return cdsFeatures;
}

async function parseGFF3(gff3Source: string): Promise<CDSFeature[]> {
    const response = await fetch(gff3Source);
    const content = await response.text();
    const lines = content.split('\n');

    let cdsFeatures: CDSFeature[] = [];

    cdsFeatures = getCDS(lines, cdsFeatures, 'CDS');
    if (cdsFeatures.length === 0) {
        cdsFeatures = getCDS(lines, cdsFeatures, 'gene');
    }

    return cdsFeatures;
}
