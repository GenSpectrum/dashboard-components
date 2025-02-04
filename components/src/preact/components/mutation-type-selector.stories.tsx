import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, within } from '@storybook/test';
import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import {
    type DisplayedMutationType,
    MutationTypeSelector,
    type MutationTypeSelectorProps,
} from './mutation-type-selector';

const meta: Meta<MutationTypeSelectorProps> = {
    title: 'Component/Mutation type selector',
    component: MutationTypeSelector,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent<{
    displayedMutationTypes: DisplayedMutationType[];
}> = ({ displayedMutationTypes: initialMutationTypes }) => {
    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>(initialMutationTypes);

    return (
        <MutationTypeSelector
            displayedMutationTypes={displayedMutationTypes}
            setDisplayedMutationTypes={(mutationTypes: DisplayedMutationType[]) => {
                setDisplayedMutationTypes(mutationTypes);
            }}
        />
    );
};

const MutationTypeSelectorStory: StoryObj<MutationTypeSelectorProps> = {
    render: (args) => {
        return <WrapperWithState {...args} />;
    },
};

export const AllMutationTypesSelected: StoryObj<MutationTypeSelectorProps> = {
    ...MutationTypeSelectorStory,
    args: {
        displayedMutationTypes: [
            {
                label: 'Substitution',
                type: 'substitution',
                checked: true,
            },
            {
                label: 'Deletion',
                type: 'deletion',
                checked: true,
            },
        ],
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Show short form of types as label', async () => {
            await expect(canvas.getByText('Subst., Del.')).toBeInTheDocument();
        });
    },
};

export const NoMutationTypesSelected: StoryObj<MutationTypeSelectorProps> = {
    ...MutationTypeSelectorStory,
    args: {
        displayedMutationTypes: [
            {
                label: 'Substitution',
                type: 'substitution',
                checked: false,
            },
            {
                label: 'Deletion',
                type: 'deletion',
                checked: false,
            },
        ],
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Show 'No types' as label", async () => {
            await expect(canvas.getByText('No types')).toBeInTheDocument();
        });
    },
};

export const OneTypesSelected: StoryObj<MutationTypeSelectorProps> = {
    ...MutationTypeSelectorStory,
    args: {
        displayedMutationTypes: [
            {
                label: 'Substitution',
                type: 'substitution',
                checked: true,
            },
            {
                label: 'Deletion',
                type: 'deletion',
                checked: false,
            },
        ],
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Show the selected type as label', async () => {
            const substitutionElements = canvas.getAllByText('Substitution');
            await expect(substitutionElements.length).toBe(2);
        });
    },
};
