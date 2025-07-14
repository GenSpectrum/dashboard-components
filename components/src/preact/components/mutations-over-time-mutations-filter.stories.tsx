import { type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { type Meta } from '@storybook/web-components';
import { useState, type Dispatch, type StateUpdater } from 'preact/hooks';

import {
    MutationsOverTimeMutationsFilter,
    type MutationsOverTimeMutationsFilterProps,
} from './mutations-over-time-mutations-filter';
import { MutationAnnotationsContextProvider } from '../MutationAnnotationsContext';
import { type MutationFilter } from '../mutationsOverTime/getFilteredMutationsOverTimeData';

const meta: Meta = {
    title: 'Component/Mutations over time mutations filter',
    component: 'MutationsOverTimeTextFilter',
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState = ({
    setFilterValue,
    value,
}: {
    setFilterValue: Dispatch<StateUpdater<MutationFilter>>;
    value: MutationFilter;
}) => {
    const [state, setState] = useState(value);

    return (
        <MutationAnnotationsContextProvider
            value={[
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
            ]}
        >
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
