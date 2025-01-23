import { InfoHeadline2, InfoLink, InfoParagraph } from './info';

export const SubstitutionsLink = () => (
    <InfoLink href='https://www.genome.gov/genetics-glossary/Substitution'>substitutions</InfoLink>
);

export const InsertionsLink = () => (
    <InfoLink href='https://www.genome.gov/genetics-glossary/Insertion'>insertions</InfoLink>
);

export const DeletionsLink = () => (
    <InfoLink href='https://www.genome.gov/genetics-glossary/Deletion'>deletions</InfoLink>
);

export const ProportionExplanation = () => (
    <>
        <InfoHeadline2>Proportion calculation</InfoHeadline2>
        <InfoParagraph>
            The proportion of a mutation is calculated by dividing the number of sequences with the mutation by the
            total number of sequences with a non-ambiguous symbol at the position.
        </InfoParagraph>
        <InfoParagraph>
            <b>Example:</b> Assume we look at nucleotide mutations at position 5 where the reference has a T and assume
            there are 10 sequences in total:
            <ul className='list-disc list-inside ml-2'>
                <li>3 sequences have a C,</li>
                <li>2 sequences have a T,</li>
                <li>1 sequence has a G,</li>
                <li>3 sequences have an N,</li>
                <li>1 sequence has a Y (which means T or C),</li>
            </ul>
            then the proportion of the T5C mutation is 50%. The 4 sequences that have an N or Y are excluded from the
            calculation.
        </InfoParagraph>
    </>
);
