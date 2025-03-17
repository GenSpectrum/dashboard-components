import { loadGff3 } from '../preact/genomeViewer/loadGff3';

export async function queryGff3Data(gff3Source: string) {
    const [cdsFeatures] = await Promise.all([loadGff3(gff3Source)]);

    return cdsFeatures;
}
