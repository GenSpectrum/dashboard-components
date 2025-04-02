import { type FunctionComponent } from 'preact';
import { useContext, useState } from 'preact/hooks';

import { type CheckboxItem, CheckboxSelector } from './checkbox-selector';
import { getSegmentNames } from '../../lapisApi/ReferenceGenome';
import { type SequenceType } from '../../types';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';

export type DisplayedSegment = CheckboxItem & {
    segment: string;
};

export type SegmentSelectorProps = {
    displayedSegments: DisplayedSegment[];
    setDisplayedSegments: (items: DisplayedSegment[]) => void;
    sequenceType: SequenceType;
};

export const SegmentSelector: FunctionComponent<SegmentSelectorProps> = ({
    displayedSegments,
    setDisplayedSegments,
    sequenceType,
}) => {
    if (displayedSegments.length <= 1) {
        return null;
    }

    return (
        <div className='w-24 inline-flex'>
            <CheckboxSelector
                items={displayedSegments}
                label={getSegmentSelectorLabel(displayedSegments, sequenceType)}
                setItems={(items) => setDisplayedSegments(items)}
            />
        </div>
    );
};

const getSegmentSelectorLabel = (displayedSegments: DisplayedSegment[], sequenceType: SequenceType) => {
    const allSelectedSelected = displayedSegments
        .filter((segment) => segment.checked)
        .map((segment) => segment.segment);

    const label = sequenceType === 'amino acid' ? 'gene' : 'segment';

    if (allSelectedSelected.length === 0) {
        return `No ${label}s`;
    }
    if (displayedSegments.length === allSelectedSelected.length) {
        return `All ${label}s`;
    }

    const longestDisplayString = `All ${label}s`;

    const allSelectedSelectedString = allSelectedSelected.join(', ');

    if (longestDisplayString.length >= allSelectedSelectedString.length) {
        return allSelectedSelectedString;
    }

    return `${allSelectedSelected.length} ${allSelectedSelected.length === 1 ? label : `${label}s`}`;
};

export function useDisplayedSegments(sequenceType: SequenceType) {
    const referenceGenome = useContext(ReferenceGenomeContext);

    const displayedSegments = getSegmentNames(referenceGenome, sequenceType).map((segment) => ({
        segment,
        label: segment,
        checked: true,
    }));

    return useState<DisplayedSegment[]>(displayedSegments);
}
