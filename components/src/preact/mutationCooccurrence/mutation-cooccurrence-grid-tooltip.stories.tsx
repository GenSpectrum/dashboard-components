import { type Meta, type StoryObj } from '@storybook/preact';

import {
    MutationCooccurrenceGridTooltip,
    type MutationCooccurrenceGridTooltipProps,
} from './mutation-cooccurrence-grid-tooltip';
import { parseDateStringToTemporal } from '../../utils/temporalClass';

const meta: Meta<MutationCooccurrenceGridTooltipProps> = {
    title: 'Component/MutationCooccurrenceGridTooltip',
    component: MutationCooccurrenceGridTooltip,
};

export default meta;

const weekDate = parseDateStringToTemporal('2024-01-15', 'week');

export const WithValue: StoryObj<MutationCooccurrenceGridTooltipProps> = {
    args: {
        pattern: { alleles: { '[123]': 'A', '[124]': 'T', '[126]': 'G' } },
        date: weekDate,
        value: { type: 'value', count: 120, proportion: 0.567, totalCount: 212 },
    },
};

export const NoData: StoryObj<MutationCooccurrenceGridTooltipProps> = {
    args: {
        pattern: { alleles: { '[123]': 'A', '[124]': 'T', '[126]': 'G' } },
        date: weekDate,
        value: null,
    },
};

export const WithNullAllele: StoryObj<MutationCooccurrenceGridTooltipProps> = {
    args: {
        pattern: { alleles: { '[123]': null, '[124]': 'T', '[126]': null } },
        date: weekDate,
        value: { type: 'value', count: 5, proportion: 0.024, totalCount: 212 },
    },
};

export const BelowThreshold: StoryObj<MutationCooccurrenceGridTooltipProps> = {
    args: {
        pattern: { alleles: { '[123]': 'A', '[124]': 'T', '[126]': 'G' } },
        date: weekDate,
        value: { type: 'belowThreshold', totalCount: 100 },
    },
};
