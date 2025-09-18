import { useContext } from 'preact/hooks';

import { isSingleSegmented, type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { ExampleMutation } from './ExampleMutation';
import Info, { InfoHeadline1, InfoHeadline2, InfoParagraph } from '../components/info';

export const MutationFilterInfo = () => {
    return (
        <Info>
            <InfoHeadline1> Mutation Filter</InfoHeadline1>
            <InfoParagraph>This component allows you to filter for mutations at specific positions.</InfoParagraph>

            <QuickStart />
            <NucleotideMutationsInfo />
            <AminoAcidMutationsInfo />
            <InsertionWildcards />
            <MultipleMutations />
            <AnyMutation />
            <NoMutation />
        </Info>
    );
};

const QuickStart = () => {
    const referenceGenome = useContext(ReferenceGenomeContext);
    return (
        <>
            <InfoHeadline2>Quickstart</InfoHeadline2>
            <InfoParagraph>
                <ul className='list-disc list-inside'>
                    {referenceGenome.nucleotideSequences.length > 0 && (
                        <li>
                            Filter for nucleotide mutations:{' '}
                            <ExampleMutation mutationType='substitution' sequenceType='nucleotide' />
                        </li>
                    )}
                    {referenceGenome.genes.length > 0 && (
                        <li>
                            Filter for amino acid mutations:{' '}
                            <ExampleMutation mutationType='substitution' sequenceType='amino acid' />
                        </li>
                    )}
                    {referenceGenome.nucleotideSequences.length > 0 && (
                        <li>
                            Filter for nucleotide insertions:{' '}
                            <ExampleMutation mutationType='insertion' sequenceType='nucleotide' />
                        </li>
                    )}
                    {referenceGenome.genes.length > 0 && (
                        <li>
                            Filter for amino acid insertions:{' '}
                            <ExampleMutation mutationType='insertion' sequenceType='amino acid' />
                        </li>
                    )}
                </ul>
            </InfoParagraph>
            {referenceGenome.nucleotideSequences.length > 1 && (
                <InfoParagraph>
                    This organism has the following segments:{' '}
                    {referenceGenome.nucleotideSequences.map((gene) => gene.name).join(', ')}.
                </InfoParagraph>
            )}
            {referenceGenome.nucleotideSequences.length === 0 && (
                <InfoParagraph>This organism doesn't support nucleotide sequences.</InfoParagraph>
            )}
            {referenceGenome.genes.length !== 0 ? (
                <InfoParagraph>
                    This organism has the following genes: {referenceGenome.genes.map((gene) => gene.name).join(', ')}.
                </InfoParagraph>
            ) : (
                <InfoParagraph>This organism doesn't support amino acid sequences.</InfoParagraph>
            )}
        </>
    );
};

const NucleotideMutationsInfo = () => {
    const referenceGenome = useContext(ReferenceGenomeContext);

    if (referenceGenome.nucleotideSequences.length === 0) {
        return null;
    }

    if (isSingleSegmented(referenceGenome)) {
        return (
            <>
                <InfoHeadline2>Nucleotide Mutations and Insertions</InfoHeadline2>
                <InfoParagraph>
                    This organism is single-segmented. Thus, nucleotide mutations have the format{' '}
                    <b>&lt;position&gt;&lt;base&gt;</b> or <b>&lt;base_ref&gt;&lt;position&gt;&lt;base&gt;</b>. The{' '}
                    <b>&lt;base_ref&gt;</b> is the reference base at the position. It is optional. A <b>&lt;base&gt;</b>{' '}
                    can be one of the four nucleotides <b>A</b>, <b>T</b>, <b>C</b>, and <b>G</b>. It can also be{' '}
                    <b>-</b> for deletion and <b>N</b> for unknown. For example if the reference sequence is <b>A</b> at
                    position <b>23</b> both: <b>23T</b> and <b>A23T</b> will yield the same results.
                </InfoParagraph>
                <InfoParagraph>
                    Insertions can be searched for in the same manner, they just need to have <b>ins_</b> appended to
                    the start of the mutation. Example: <b>ins_1046:A</b> would filter for sequences with an insertion
                    of A between the positions 1046 and 1047 in the nucleotide sequence.
                </InfoParagraph>
            </>
        );
    }

    const firstSegment = referenceGenome.nucleotideSequences[0].name;
    return (
        <>
            <InfoHeadline2>Nucleotide Mutations and Insertions</InfoHeadline2>
            <InfoParagraph>
                This organism is multi-segmented. Thus, nucleotide mutations have the format{' '}
                <b>&lt;segment&gt;:&lt;position&gt;&lt;base&gt;</b> or{' '}
                <b>&lt;segment&gt;:&lt;base_ref&gt;&lt;position&gt;&lt;base&gt;</b>. <b>&lt;base_ref&gt;</b> is the
                reference base at the position. It is optional. A <b>&lt;base&gt;</b> can be one of the four nucleotides{' '}
                <b>A</b>, <b>T</b>, <b>C</b>, and <b>G</b>. It can also be <b>-</b> for deletion and <b>N</b> for
                unknown. For example if the reference sequence is <b>A</b> at position <b>23</b> both:{' '}
                <b>{firstSegment}:23T</b> and <b>{firstSegment}:A23T</b> will yield the same results.
            </InfoParagraph>
            <InfoParagraph>
                Insertions can be searched for in the same manner, they just need to have <b>ins_</b> appended to the
                start of the mutation. Example: <ExampleMutation mutationType='insertion' sequenceType='nucleotide' />.
            </InfoParagraph>
        </>
    );
};

const AminoAcidMutationsInfo = () => {
    const referenceGenome = useContext(ReferenceGenomeContext);

    if (referenceGenome.genes.length === 0) {
        return null;
    }

    const firstGene = referenceGenome.genes[0].name;

    return (
        <>
            <InfoHeadline2>Amino Acid Mutations and Insertions</InfoHeadline2>
            <InfoParagraph>
                An amino acid mutation has the format <b>&lt;gene&gt;:&lt;position&gt;&lt;base&gt;</b> or
                <b>&lt;gene&gt;:&lt;base_ref&gt;&lt;position&gt;&lt;base&gt;</b>. A <b>&lt;base&gt;</b> can be one of
                the 20 amino acid codes. It can also be <b>*</b> for a stop codon, <b>-</b> for deletion and <b>X</b>{' '}
                for unknown. Example: <ExampleMutation mutationType='substitution' sequenceType='amino acid' />.
            </InfoParagraph>
            <InfoParagraph>
                Insertions can be searched for in the same manner, they just need to have <b>ins_</b> appended to the
                start of the mutation. Example: <b>ins_{firstGene}:31:N</b> would filter for sequences with an insertion
                of N between positions 31 and 32 in the gene {firstGene}.
            </InfoParagraph>
        </>
    );
};

const InsertionWildcards = () => {
    const referenceGenome = useContext(ReferenceGenomeContext);

    if (referenceGenome.nucleotideSequences.length === 0 && referenceGenome.genes.length === 0) {
        return null;
    }

    return (
        <>
            <InfoHeadline2>Insertion Wildcards</InfoHeadline2>
            <InfoParagraph>
                This component supports nucleotide and amino acid insertion queries that contain wildcards <b>?</b>. For
                example{' '}
                <b>
                    ins_{exampleSegmentString(referenceGenome)}214:?{exampleWildcardInsertion(referenceGenome)}?
                </b>{' '}
                will match all cases where segment <b>{exampleSegment(referenceGenome)}</b> has an insertion of{' '}
                <b>{exampleWildcardInsertion(referenceGenome)}</b> between the positions <b>214</b> and <b>215</b> but
                also an insertion of other amino acids which include the <b>EP</b>, e.g. the insertion{' '}
                <b>{exampleWildcardInsertion(referenceGenome)}T</b> will be matched.
            </InfoParagraph>
            <InfoParagraph>
                You can also use wildcards to match any insertion at a given position. For example{' '}
                <b>ins_{exampleSegmentString(referenceGenome)}214:?</b> match any (but at least one) insertion between
                the positions 214 and 215.
            </InfoParagraph>
        </>
    );
};

const exampleSegmentString = (referenceGenome: ReferenceGenome) => {
    const segment = exampleSegment(referenceGenome);
    if (segment === '') {
        return '';
    }
    return `${segment}:`;
};

const exampleSegment = (referenceGenome: ReferenceGenome) => {
    if (referenceGenome.genes.length > 0) {
        return referenceGenome.genes[0].name;
    }
    if (referenceGenome.nucleotideSequences.length > 1) {
        return referenceGenome.nucleotideSequences[0].name;
    }
    return '';
};

const exampleWildcardInsertion = (referenceGenome: ReferenceGenome) => {
    if (referenceGenome.genes.length > 0) {
        return 'EP';
    }
    if (referenceGenome.nucleotideSequences.length > 0) {
        return 'CG';
    }
    return '';
};

const MultipleMutations = () => {
    return (
        <>
            <InfoHeadline2>Multiple Mutations</InfoHeadline2>
            <InfoParagraph>
                Multiple mutation filters can be provided by adding one mutation after the other.
            </InfoParagraph>
        </>
    );
};

const AnyMutation = () => {
    const referenceGenome = useContext(ReferenceGenomeContext);

    return (
        <>
            <InfoHeadline2>Any Mutation</InfoHeadline2>
            <InfoParagraph>
                To filter for any mutation at a given position you can omit the <b>&lt;base&gt;</b>. Example:{' '}
                <b>{exampleSegmentString(referenceGenome)}20</b>.
            </InfoParagraph>
        </>
    );
};

const NoMutation = () => {
    return (
        <>
            <InfoHeadline2>No Mutation</InfoHeadline2>
            <InfoParagraph>
                You can write a <b>.</b> for the <b>&lt;base&gt;</b> to filter for sequences for which it is confirmed
                that no mutation occurred, i.e. has the same base as the reference genome at the specified position.
            </InfoParagraph>
        </>
    );
};
