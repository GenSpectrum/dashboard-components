import z from 'zod';

import { ColorsRGB, type GraphColor } from '../shared/charts/colors';

export const Gff3SourceSchema = z.object({
    url: z.string().min(1),
});
export type Gff3Source = z.infer<typeof Gff3SourceSchema>;

export async function loadGff3(gff3Source: Gff3Source) {
    return await parseGFF3(gff3Source);
}

export type CDSFeature = {
    start: number;
    end: number;
    label: string;
    color: GraphColor;
};

async function parseGFF3(gff3Source: Gff3Source): Promise<CDSFeature[]> {
    const response = await fetch(gff3Source.url);
    const content = await response.text();
    const lines = content.split('\n');

    const cdsFeatures: CDSFeature[] = [];
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

        if (type !== 'CDS') {
            continue;
        }

        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        // Extract label from attributes (try gene= or Name=)
        let label = 'CDS';
        const attrPairs = attributes.split(';');
        for (const pair of attrPairs) {
            if (pair.startsWith('gene=')) {
                label = pair.replace('gene=', '');
                break;
            } else if (pair.startsWith('Name=')) {
                label = pair.replace('Name=', '');
            }
        }

        const GraphColorList: GraphColor[] = Object.keys(ColorsRGB) as GraphColor[];
        const color: GraphColor = GraphColorList[colorIndex % GraphColorList.length];
        colorIndex++;

        cdsFeatures.push({ start, end, label, color });
    }

    return cdsFeatures;
}
