import { describe, expect, test } from 'vitest';

import { type CDSFeature, parseGFF3, loadGenomeLength } from './loadGff3';

const SplicedGeneData = `
##gff-version 3
#!gff-spec-version 1.21
#!processor NCBI annotwriter
##sequence-region NC_026431.1 1 982
##species https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=641809
NC_026431.1	RefSeq	region	1	982	.	+	.	ID=NC_026431.1:1..982;Dbxref=taxon:641809;Name=7;collection-date=09-Apr-2009;country=USA: California state;gbkey=Src;genome=genomic;mol_type=viral cRNA;nat-host=Homo sapiens%3B gender M%3B age 54;segment=7;serotype=H1N1;strain=A/California/07/2009
NC_026431.1	RefSeq	CDS	1	26	.	+	0	Name=M2;gene=M2;gbkey=CDS;locus_tag=UJ99_s7gp1;protein_id=YP_009118622.1;product=matrix protein 2;ID=cds-YP_009118622.1;Dbxref=GenBank:YP_009118622.1,GeneID:23308108
NC_026431.1	RefSeq	CDS	715	982	.	+	1	Name="M2";gene=M2;gbkey=CDS;locus_tag=UJ99_s7gp1;protein_id=YP_009118622.1;product=matrix protein 2;ID=cds-YP_009118622.1;Dbxref=GenBank:YP_009118622.1,GeneID:23308108
NC_026431.1	RefSeq	CDS	1	759	.	+	0	Name=M1;gene=M1;gbkey=CDS;locus_tag=UJ99_s7gp2;protein_id=YP_009118623.1;product=matrix protein 1;ID=cds-YP_009118623.1;Dbxref=GenBank:YP_009118623.1,GeneID:23308107
NC_026431.1	RefSeq	CDS	760	790	.	+	0	Name=fakeGene;gene=fakeGene;gbkey=CDS;locus_tag=UJ99_s7fake;protein_id=YP_009118624.1;product=None;ID=cds-YP_009118624.1;Dbxref=GenBank:YP_009118624.1,GeneID:23308109
`;

describe('parseGFF3', () => {
    test('should parse GFF3 correctly', () => {
        const result: CDSFeature[][] = parseGFF3(SplicedGeneData);

        expect(result).to.deep.equal([
            [
                {
                    color: 'sand',
                    positions: [
                        { start: 1, end: 26 },
                        { start: 715, end: 982 },
                    ],
                    label: 'M2',
                },
            ],
            [
                { color: 'rose', positions: [{ start: 1, end: 759 }], label: 'M1' },
                { color: 'wine', positions: [{ start: 760, end: 790 }], label: 'fakeGene' },
            ],
        ]);
    });
});

describe('loadGenomeLength', () => {
    test('should calculate genome length correctly', () => {
        const length = loadGenomeLength(SplicedGeneData);

        expect(length).to.equal(982);
    });
});

const invalidInput = `
##gff-version 3
#!gff-spec-version 1.21
#!processor NCBI annotwriter
##sequence-region NC_026431.1 1`;

describe('loadGenomeLength', () => {
    test('should throw an error when passed invalid input', () => {
        expect(() => loadGenomeLength(invalidInput)).toThrow(
            'No length found in sequence-region: "##sequence-region NC_026431.1 1"',
        );
    });
});
