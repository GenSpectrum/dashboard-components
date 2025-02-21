import { expect, within } from '@storybook/test';

export const expectOptionSelected = async (canvasElement: HTMLElement, option: string) => {
    const canvas = within(canvasElement);
    const placeholderOption = canvas.getByRole('combobox').querySelector('option:checked');
    await expect(placeholderOption).toHaveTextContent(option);
};
