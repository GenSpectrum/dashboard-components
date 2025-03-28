import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, within } from '@storybook/test';
import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { type DisplayedSegment, SegmentSelector, type SegmentSelectorProps } from './segment-selector';
import type { SequenceType } from '../../types';

const meta: Meta<SegmentSelectorProps> = {
    title: 'Component/Segment selector',
    component: SegmentSelector,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent<{
    displayedSegments: DisplayedSegment[];
    sequenceType?: SequenceType;
}> = ({ displayedSegments: initialDisplayedSegments, sequenceType }) => {
    const [displayedSegments, setDisplayedSegments] = useState<DisplayedSegment[]>(initialDisplayedSegments);

    return (
        <SegmentSelector
            displayedSegments={displayedSegments}
            setDisplayedSegments={(items: DisplayedSegment[]) => {
                setDisplayedSegments(items);
            }}
            sequenceType={sequenceType}
        />
    );
};

export const AllSegmentsSelected: StoryObj<SegmentSelectorProps> = {
    render: (args) => {
        return <WrapperWithState {...args} />;
    },
    args: {
        displayedSegments: [
            {
                segment: 'ORF1a',
                label: 'ORF1a',
                checked: true,
            },
            {
                segment: 'S',
                label: 'S',
                checked: true,
            },
            {
                segment: 'VeryLongSegmentName',
                label: 'VeryLongSegmentName',
                checked: true,
            },
        ],
        sequenceType: 'amino acid',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Show 'All segments' as label", async () => {
            await expect(canvas.getByText('All segments')).toBeInTheDocument();
        });
    },
};

export const NoSegmentsSelected: StoryObj<SegmentSelectorProps> = {
    ...AllSegmentsSelected,
    args: {
        displayedSegments: [
            {
                segment: 'ORF1a',
                label: 'ORF1a',
                checked: false,
            },
            {
                segment: 'S',
                label: 'S',
                checked: false,
            },
            {
                segment: 'VeryLongSegmentName',
                label: 'VeryLongSegmentName',
                checked: false,
            },
        ],
        sequenceType: 'amino acid',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Show 'No segments' as label", async () => {
            await expect(canvas.getByText('No segments')).toBeInTheDocument();
        });
    },
};

export const LongSegmentsSelected: StoryObj<SegmentSelectorProps> = {
    ...AllSegmentsSelected,
    args: {
        displayedSegments: [
            {
                segment: 'ORF1a',
                label: 'ORF1a',
                checked: true,
            },
            {
                segment: 'S',
                label: 'S',
                checked: false,
            },
            {
                segment: 'VeryLongSegmentName',
                label: 'VeryLongSegmentName',
                checked: true,
            },
        ],
        sequenceType: 'amino acid',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Show number of active segments as label', async () => {
            await expect(canvas.getByText('2 segments')).toBeInTheDocument();
        });
    },
};

export const ShortSegmentsSelected: StoryObj<SegmentSelectorProps> = {
    ...AllSegmentsSelected,
    args: {
        displayedSegments: [
            {
                segment: 'ORF1a',
                label: 'ORF1a',
                checked: true,
            },
            {
                segment: 'S',
                label: 'S',
                checked: true,
            },
            {
                segment: 'VeryLongSegmentName',
                label: 'VeryLongSegmentName',
                checked: false,
            },
        ],
        sequenceType: 'amino acid',
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Show active segments as label', async () => {
            await expect(canvas.getByText('ORF1a, S')).toBeInTheDocument();
        });
    },
};
