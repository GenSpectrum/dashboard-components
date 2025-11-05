import { type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { type Meta } from '@storybook/web-components';
import { useState, type Dispatch, type StateUpdater } from 'preact/hooks';

import {
    MutationsOverTimeMutationsFilter,
    type MutationsOverTimeMutationsFilterProps,
} from './mutations-over-time-mutations-filter';
import { type MutationAnnotations } from '../../web-components/mutation-annotations-context';
import { MutationAnnotationsContextProvider } from '../MutationAnnotationsContext';
import { type MutationFilter } from '../mutationsOverTime/getFilteredMutationsOverTimeData';

const meta: Meta = {
    title: 'Component/Mutations over time mutations filter',
    component: 'MutationsOverTimeTextFilter',
    parameters: { fetchMock: {} },
};

export default meta;

const manyMutationAnnotations = Array.from({ length: 300 }, (_, i) => ({
    name: `Annotation ${i + 1}`,
    description: `This is test annotation number ${i + 1} for testing many annotations.`,
    symbol: String.fromCharCode(33 + (i % 94)), // Cycle through printable ASCII characters
    nucleotideMutations: ['A23G'],
    aminoAcidMutations: [],
})) satisfies MutationAnnotations;

const WrapperWithState = ({
    setFilterValue,
    value,
    annotations = [
        {
            name: 'Test Annotation 1',
            description: 'Test Annotation 1',
            symbol: '#',
        },
        {
            name: 'Test Annotation 2',
            description: 'Test Annotation 2',
            symbol: '+',
        },
    ],
}: {
    setFilterValue: Dispatch<StateUpdater<MutationFilter>>;
    value: MutationFilter;
    annotations?: MutationAnnotations;
}) => {
    const [state, setState] = useState(value);

    return (
        <MutationAnnotationsContextProvider value={annotations}>
            <MutationsOverTimeMutationsFilter
                setFilterValue={(value) => {
                    setFilterValue(value);
                    setState(value);
                }}
                value={state}
            />
        </MutationAnnotationsContextProvider>
    );
};

export const FilterByText: StoryObj<MutationsOverTimeMutationsFilterProps> = {
    render: (args) => {
        return <WrapperWithState setFilterValue={args.setFilterValue} value={args.value} />;
    },
    args: {
        setFilterValue: fn(),
        value: { textFilter: 'Test', annotationNameFilter: new Set([]) },
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Expect initial value to show on the button', async () => {
            const button = canvas.getByRole('button');
            await expect(button).toHaveTextContent('Test');
        });

        await step('Change filter and expect it to show on the button', async () => {
            const button = canvas.getByRole('button');
            await userEvent.click(button);

            const inputField = canvas.getByRole('textbox');
            await userEvent.clear(inputField);
            await userEvent.type(inputField, 'OtherText');

            await waitFor(() => expect(button).toHaveTextContent('OtherText'));
        });
    },
};

export const FilterByAnnotation: StoryObj<MutationsOverTimeMutationsFilterProps> = {
    ...FilterByText,
    args: {
        setFilterValue: fn(),
        value: { textFilter: '', annotationNameFilter: new Set() },
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Expect default text to show on the button', async () => {
            const button = canvas.getByRole('button');
            await expect(button).toHaveTextContent('Filter mutations');
        });

        await step('Change filter and expect it to show on the button', async () => {
            const button = canvas.getByRole('button');
            await userEvent.click(button);

            const inputField = canvas.getByRole('checkbox', { name: /Test Annotation 1/ });
            await userEvent.click(inputField);

            await waitFor(() => expect(button).toHaveTextContent('Test Annotation 1'));
        });
    },
};

export const WithManyMutationAnnotations: StoryObj<MutationsOverTimeMutationsFilterProps> = {
    render: (args) => {
        return (
            <WrapperWithState
                setFilterValue={args.setFilterValue}
                value={args.value}
                annotations={manyMutationAnnotations}
            />
        );
    },
    args: {
        setFilterValue: fn(),
        value: { textFilter: '', annotationNameFilter: new Set() },
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Open filter dropdown', async () => {
            const filterButton = canvas.getByRole('button', { name: 'Filter mutations' });
            await userEvent.click(filterButton);
        });

        await step('Verify scroll container is scrollable', () => {
            const scrollContainer = canvas
                .getByText('Filter by annotations')
                .parentElement!.querySelector('.overflow-scroll')!;
            void expect(scrollContainer).toBeInTheDocument();

            // Verify the container has scrollable content
            void expect(scrollContainer.scrollHeight).toBeGreaterThan(scrollContainer.clientHeight);
        });

        await step('Scroll to bottom and verify we can scroll', async () => {
            const scrollContainer = canvas
                .getByText('Filter by annotations')
                .parentElement!.querySelector('.overflow-scroll')!;

            const initialScrollTop = scrollContainer.scrollTop;

            // Scroll to the bottom
            scrollContainer.scrollTop = scrollContainer.scrollHeight;

            await waitFor(async () => {
                // Verify that scrollTop actually changed
                await expect(scrollContainer.scrollTop).toBeGreaterThan(initialScrollTop);
            });
        });
    },
};
