import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import { AnnotatedMutation, type AnnotatedMutationProps } from './annotated-mutation';
import { type MutationAnnotations } from '../../web-components/mutation-annotations-context';
import { MutationAnnotationsContextProvider } from '../MutationAnnotationsContext';

const meta: Meta<AnnotatedMutationProps & { annotations: MutationAnnotations }> = {
    title: 'Component/Annotated Mutation',
    component: AnnotatedMutation,
    parameters: { fetchMock: {} },
    argTypes: {
        annotations: { control: { type: 'object' } },
        mutation: { control: { type: 'object' } },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
    },
};

export default meta;

export const MutationWithoutAnnotationEntry: StoryObj<AnnotatedMutationProps & { annotations: MutationAnnotations }> = {
    render: (args) => {
        const { annotations, ...annotatedMutationsArgs } = args;

        return (
            <MutationAnnotationsContextProvider value={annotations}>
                <AnnotatedMutation {...annotatedMutationsArgs} />
            </MutationAnnotationsContextProvider>
        );
    },
    args: {
        mutation: {
            type: 'substitution',
            code: 'A23403G',
            position: 23403,
            valueAtReference: 'A',
            substitutionValue: 'G',
        },
        sequenceType: 'nucleotide',
        annotations: [
            {
                name: 'Test annotation',
                description: 'This is a test annotation',
                symbol: '*',
                nucleotideMutations: ['123T'],
                aminoAcidMutations: [],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('A23403G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).not.toBeInTheDocument();
        await expect(getAnnotationName(canvas)).not.toBeInTheDocument();
    },
};

export const MutationWithAnnotationEntry: StoryObj<AnnotatedMutationProps & { annotations: MutationAnnotations }> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        ...MutationWithoutAnnotationEntry.args,
        annotations: [
            {
                name: 'Test annotation',
                description: 'This is a test annotation',
                symbol: '*',
                nucleotideMutations: ['A23403G'],
                aminoAcidMutations: [],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('A23403G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).toBeVisible();

        await userEvent.click(canvas.getByText('A23403G'));
        await waitFor(() => expect(getAnnotationName(canvas)).toBeVisible());
    },
};

export const MutationWithMultipleAnnotationEntries: StoryObj<
    AnnotatedMutationProps & { annotations: MutationAnnotations }
> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        ...MutationWithoutAnnotationEntry.args,
        annotations: [
            {
                name: 'Test annotation',
                description: 'This is a test annotation',
                symbol: '*',
                nucleotideMutations: ['A23403G'],
                aminoAcidMutations: [],
            },
            {
                name: 'Another test annotation',
                description: 'This is a test annotation',
                symbol: '+',
                nucleotideMutations: ['A23403G'],
                aminoAcidMutations: [],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('A23403G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).toBeVisible();
        await expect(canvas.queryByText('+')).toBeVisible();

        await userEvent.click(canvas.getByText('A23403G'));
        await waitFor(() => expect(getAnnotationName(canvas)).toBeVisible());
        await expect(canvas.queryByText('Another test annotation')).toBeVisible();
    },
};

export const AminoAcidMutationWithAnnotationEntry: StoryObj<
    AnnotatedMutationProps & { annotations: MutationAnnotations }
> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        mutation: {
            type: 'substitution',
            code: 'S:A501G',
            position: 501,
            valueAtReference: 'A',
            substitutionValue: 'G',
        },
        sequenceType: 'amino acid',
        annotations: [
            {
                name: 'Test annotation',
                description: 'This is a test annotation',
                symbol: '*',
                nucleotideMutations: [],
                aminoAcidMutations: ['S:A501G'],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('S:A501G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).toBeVisible();

        await userEvent.click(canvas.getByText('S:A501G'));
        await waitFor(() => expect(getAnnotationName(canvas)).toBeVisible());
    },
};

function getAnnotationIndicator(canvas: ReturnType<typeof within>) {
    return canvas.queryByText('*');
}

function getAnnotationName(canvas: ReturnType<typeof within>) {
    return canvas.queryByText('Test annotation');
}
