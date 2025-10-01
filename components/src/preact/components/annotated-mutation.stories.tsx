import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import { AnnotatedMutation, type AnnotatedMutationProps } from './annotated-mutation';
import type { MutationAnnotations } from '../../web-components/mutation-annotations-context';
import type { MutationLinkTemplate } from '../../web-components/mutation-link-template-context';
import { MutationAnnotationsContextProvider } from '../MutationAnnotationsContext';
import { MutationLinkTemplateContextProvider } from '../MutationLinkTemplateContext';

type ContextProps = {
    annotations: MutationAnnotations;
    linkTemplate: MutationLinkTemplate;
};

type StoryProps = AnnotatedMutationProps & ContextProps;

const meta: Meta<StoryProps> = {
    title: 'Component/Annotated Mutation',
    component: AnnotatedMutation,
    parameters: { fetchMock: {} },
    argTypes: {
        annotations: { control: { type: 'object' } },
        linkTemplate: { control: { type: 'object' } },
        mutation: { control: { type: 'object' } },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
    },
};

export default meta;

export const MutationWithoutAnnotationEntry: StoryObj<StoryProps> = {
    render: (args) => {
        const { annotations, linkTemplate, ...annotatedMutationsArgs } = args;

        return (
            <MutationLinkTemplateContextProvider value={linkTemplate}>
                <MutationAnnotationsContextProvider value={annotations}>
                    <AnnotatedMutation {...annotatedMutationsArgs} />
                </MutationAnnotationsContextProvider>
            </MutationLinkTemplateContextProvider>
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
            },
        ],
        linkTemplate: {},
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('A23403G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).not.toBeInTheDocument();
        await expect(getAnnotationName(canvas)).not.toBeInTheDocument();
    },
};

export const MutationWithAnnotationEntry: StoryObj<StoryProps> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        ...MutationWithoutAnnotationEntry.args,
        annotations: [
            {
                name: 'Test annotation',
                description: 'This is a test annotation <a class="link" href="/">with a link.</a>',
                symbol: '*',
                nucleotideMutations: ['A23403G'],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('A23403G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).toBeVisible();

        await userEvent.click(canvas.getByText('*'));
        await waitFor(() => expect(getAnnotationName(canvas)).toBeVisible());
        await expect(canvas.getByRole('link', { name: 'with a link.' })).toBeVisible();
    },
};

export const MutationWithMultipleAnnotationEntries: StoryObj<StoryProps> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        ...MutationWithoutAnnotationEntry.args,
        annotations: [
            {
                name: 'Test annotation',
                description: 'This is a test annotation',
                symbol: '*',
                nucleotideMutations: ['A23403G'],
            },
            {
                name: 'Another test annotation',
                description: 'This is a test annotation',
                symbol: '+',
                nucleotideMutations: ['A23403G'],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('A23403G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).toBeVisible();
        await expect(canvas.queryByText('+')).toBeVisible();

        await userEvent.click(canvas.getByText('*'));
        await waitFor(() => expect(getAnnotationName(canvas)).toBeVisible());
        await expect(canvas.queryByText('Another test annotation')).toBeVisible();
    },
};

export const AminoAcidMutationWithAnnotationEntry: StoryObj<StoryProps> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        ...MutationWithoutAnnotationEntry.args,
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
                aminoAcidMutations: ['S:A501G'],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('S:A501G')).toBeVisible());
        await expect(getAnnotationIndicator(canvas)).toBeVisible();

        await userEvent.click(canvas.getByText('*'));
        await waitFor(() => expect(getAnnotationName(canvas)).toBeVisible());
    },
};

function getAnnotationIndicator(canvas: ReturnType<typeof within>) {
    return canvas.queryByText('*');
}

function getAnnotationName(canvas: ReturnType<typeof within>) {
    return canvas.queryByText('Test annotation');
}

export const NucleotideMutationWithLink: StoryObj<StoryProps> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        ...MutationWithoutAnnotationEntry.args,
        linkTemplate: {
            nucleotideMutation: 'http://foo.com/query?nucMut={{mutation}}',
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('A23403G')).toBeVisible());
        const link = canvas.getByText('A23403G').closest('a');
        void expect(link).toHaveAttribute('href', 'http://foo.com/query?nucMut=A23403G');
    },
};

export const AminoAcidMutationWithLink: StoryObj<StoryProps> = {
    ...MutationWithoutAnnotationEntry,
    args: {
        ...MutationWithoutAnnotationEntry.args,
        mutation: {
            type: 'substitution',
            code: 'S:A501G',
            position: 501,
            valueAtReference: 'A',
            substitutionValue: 'G',
        },
        sequenceType: 'amino acid',
        linkTemplate: {
            aminoAcidMutation: 'http://foo.com/query?aaMut={{mutation}}',
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => expect(canvas.getByText('S:A501G')).toBeVisible());
        const link = canvas.getByText('S:A501G').closest('a');
        void expect(link).toHaveAttribute('href', 'http://foo.com/query?aaMut=S%3AA501G');
    },
};
