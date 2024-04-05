import { type FunctionComponent } from 'preact';

import { type CheckboxItem, CheckboxSelector } from './checkbox-selector';

export type DisplayedSegment = CheckboxItem & {
    segment: string;
};

export type SegmentSelectorProps = {
    displayedSegments: DisplayedSegment[];
    setDisplayedSegments: (items: DisplayedSegment[]) => void;
    prefix?: string;
};

const getSegmentSelectorLabel = (displayedSegments: DisplayedSegment[], prefix: string) => {
    const allSelectedSelected = displayedSegments
        .filter((segment) => segment.checked)
        .map((segment) => segment.segment);

    if (allSelectedSelected.length === 0) {
        return `${prefix}none`;
    }
    if (displayedSegments.length === allSelectedSelected.length) {
        return `${prefix}all`;
    }
    return prefix + allSelectedSelected.join(', ');
};

export const SegmentSelector: FunctionComponent<SegmentSelectorProps> = ({
    displayedSegments,
    setDisplayedSegments,
    prefix,
}) => {
    if (displayedSegments.length === 0) {
        return null;
    }

    return (
        <CheckboxSelector
            className='mx-1'
            items={displayedSegments}
            label={getSegmentSelectorLabel(displayedSegments, prefix || 'Segments: ')}
            setItems={(items) => setDisplayedSegments(items)}
        />
    );
};
