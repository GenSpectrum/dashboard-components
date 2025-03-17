import { loadGff3, type Gff3Source } from '../preact/genomeViewer/loadGff3';

export async function queryGff3Data(gff3Source: Gff3Source) {
    const [cdsFeatures] = await Promise.all([loadGff3(gff3Source)]);

    return cdsFeatures;
}
