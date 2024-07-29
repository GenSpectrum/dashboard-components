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
};

export const SegmentSelector: FunctionComponent<SegmentSelectorProps> = ({
    displayedSegments,
    setDisplayedSegments,
}) => {
    if (displayedSegments.length <= 1) {
        return null;
    }

    return (
        <div className='w-24'>
            <CheckboxSelector
                items={displayedSegments}
                label={getSegmentSelectorLabel(displayedSegments)}
                setItems={(items) => setDisplayedSegments(items)}
            />
        </div>
    );
};

const getSegmentSelectorLabel = (displayedSegments: DisplayedSegment[]) => {
    const allSelectedSelected = displayedSegments
        .filter((segment) => segment.checked)
        .map((segment) => segment.segment);

    if (allSelectedSelected.length === 0) {
        return `No segments`;
    }
    if (displayedSegments.length === allSelectedSelected.length) {
        return `All segments`;
    }

    const longestDisplayString = `All segments`;

    const allSelectedSelectedString = allSelectedSelected.join(', ');

    if (longestDisplayString.length >= allSelectedSelectedString.length) {
        return allSelectedSelectedString;
    }

    return `${allSelectedSelected.length} ${allSelectedSelected.length === 1 ? 'segment' : 'segments'}`;
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
