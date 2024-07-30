import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fn, waitFor, within } from '@storybook/test';
import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { type CheckboxItem, CheckboxSelector, type CheckboxSelectorProps } from './checkbox-selector';

const meta: Meta<CheckboxSelectorProps> = {
    title: 'Component/Checkbox Selector',
    component: CheckboxSelector,
    argTypes: {
        setItems: { action: true },
    },
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent<CheckboxSelectorProps> = ({
    items: initialItems,
    label,
    setItems: setItemsMock,
}) => {
    const [items, setItems] = useState<CheckboxItem[]>(initialItems);

    return (
        <div className='w-32'>
            <CheckboxSelector
                items={items}
                label={label}
                setItems={(items: CheckboxItem[]) => {
                    setItemsMock(items);
                    setItems(items);
                }}
            />
        </div>
    );
};

export const CheckboxSelectorStory: StoryObj<CheckboxSelectorProps> = {
    render: (args) => {
        let wrapperStateItems = args.items;

        return (
            <WrapperWithState
                items={wrapperStateItems}
                label={args.label}
                setItems={(items: CheckboxItem[]) => {
                    args.setItems(items);
                    wrapperStateItems = items;
                }}
            />
        );
    },
    args: {
        items: [
            { checked: false, label: 'item1' },
            { checked: false, label: 'item2' },
        ],
        label: 'Some label',
        setItems: fn(),
    },
    play: async ({ canvasElement, args, step }) => {
        const canvas = within(canvasElement);

        const open = () => canvas.getByText('Some label');
        const selectAll = () => canvas.getByText('Select all');
        const selectNone = () => canvas.getByText('Select none');
        const firstItem = () => canvas.getByLabelText('item1');
        open().click();

        await step('Select one item', async () => {
            firstItem().click();

            await waitFor(() =>
                expect(args.setItems).toHaveBeenCalledWith([
                    { checked: true, label: 'item1' },
                    { checked: false, label: 'item2' },
                ]),
            );
        });

        await step('Select all items with one item already selected', async () => {
            selectAll().click();

            await waitFor(() =>
                expect(args.setItems).toHaveBeenCalledWith([
                    { checked: true, label: 'item1' },
                    { checked: true, label: 'item2' },
                ]),
            );
        });

        await step('Deselect one item', async () => {
            firstItem().click();

            await waitFor(() =>
                expect(args.setItems).toHaveBeenCalledWith([
                    { checked: false, label: 'item1' },
                    { checked: true, label: 'item2' },
                ]),
            );
        });

        await step('Select none with one item already selected', async () => {
            selectNone().click();

            await waitFor(() =>
                expect(args.setItems).toHaveBeenCalledWith([
                    { checked: false, label: 'item1' },
                    { checked: false, label: 'item2' },
                ]),
            );
        });

        await step('Select all items with none selected', async () => {
            selectAll().click();

            await waitFor(() =>
                expect(args.setItems).toHaveBeenCalledWith([
                    { checked: true, label: 'item1' },
                    { checked: true, label: 'item2' },
                ]),
            );
        });

        await step('Select none with all items selected', async () => {
            selectNone().click();

            await waitFor(() =>
                expect(args.setItems).toHaveBeenCalledWith([
                    { checked: false, label: 'item1' },
                    { checked: false, label: 'item2' },
                ]),
            );
        });
    },
};
