import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-checkbox-selector';
import { withinShadowRoot } from '../../storybook/withinShadowRoot.story';
import { expect } from '@storybook/jest';

const meta: Meta = {
    title: 'Component/Checkbox Selector',
    component: 'gs-component-checkbox-selector',
    argTypes: {
        setItems: { action: true },
    },
    parameters: { fetchMock: {} },
};

export default meta;

export const ClosedCheckboxSelectorStory: StoryObj = {
    render: (args) => html`
        <gs-component-checkbox-selector
            .items=${args.items}
            label=${args.label}
            .setItems=${args.setItems}
        ></gs-component-checkbox-selector>
    `,
    play: async ({ canvasElement, args }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-component-checkbox-selector');
        const button = canvas.getByText(args.label);
        button.click();
        canvasElement.click();
        await expect(args.setItems).not.toHaveBeenCalled();
    },
    args: {
        items: [
            { checked: false, label: 'item1' },
            { checked: false, label: 'item2' },
        ],
        label: 'someLabel',
    },
};

export const OpenCheckboxSelectorStory: StoryObj = {
    render: (args) => {
        return html`
            <gs-component-checkbox-selector
                .items=${args.items}
                label=${args.label}
                .setItems=${args.setItems}
            ></gs-component-checkbox-selector>
        `;
    },
    play: async ({ canvasElement, args }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-component-checkbox-selector');
        const button = canvas.getByText(args.label);
        button.click();

        const checkBox = canvas.getByLabelText(args.items[0].label);
        checkBox.click();

        await expect(checkBox).toBeChecked();
        await expect(args.setItems).toHaveBeenCalledWith([{ ...args.items[0], checked: true }, args.items[1]]);
    },
    args: {
        items: [
            { checked: false, label: 'item1' },
            { checked: false, label: 'item2' },
        ],
        label: 'someLabel',
    },
};
