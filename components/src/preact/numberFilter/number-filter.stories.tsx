import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { type StepFunction } from '@storybook/types';

import { gsNumberFilterChangedEventName } from './NumberFilterChangedEvent';
import { NumberFilter, type NumberFilterProps } from './number-filter';

const meta: Meta<NumberFilterProps> = {
    title: 'Input/Number filter',
    component: NumberFilter,
    parameters: {
        fetchMock: {},
        actions: {
            handles: [gsNumberFilterChangedEventName],
        },
    },
    argTypes: {
        value: {
            control: {
                type: 'object',
            },
        },
        lapisField: {
            control: {
                type: 'text',
            },
        },
        width: {
            control: {
                type: 'text',
            },
        },
    },
};

export default meta;

const Template: StoryObj<NumberFilterProps> = {
    render: (args) => <NumberFilter {...args} />,
    args: {
        lapisField: 'age',
        value: { min: 10, max: 90 },
        width: '100%',
    },
};

export const SetMinValue: StoryObj<NumberFilterProps> = {
    ...Template,
    play: async ({ canvasElement, step }) => {
        const { expectEventWithDetail, minInput, maxInput, clearMinButton } = await setup(canvasElement, step);

        await step('clear min input', async () => {
            await userEvent.click(clearMinButton());
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('');
                await expect(maxInput()).toHaveValue('90');
            });
            await expectEventWithDetail({
                ageFrom: undefined,
                ageTo: 90,
            });
        });

        await step('type a value into min input', async () => {
            await userEvent.type(minInput(), '9');
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('9');
                await expect(maxInput()).toHaveValue('90');
            });
            await expectEventWithDetail({
                ageFrom: 9,
                ageTo: 90,
            });
        });

        await step('make min input larger than max input and expect that max is shifted accordingly', async () => {
            await userEvent.type(minInput(), '8');
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('98');
                await expect(maxInput()).toHaveValue('98');
            });
            await expectEventWithDetail({
                ageFrom: 98,
                ageTo: 98,
            });
        });
    },
};

export const SetMaxValue: StoryObj<NumberFilterProps> = {
    ...Template,
    play: async ({ canvasElement, step }) => {
        const { expectEventWithDetail, minInput, maxInput, clearMaxButton } = await setup(canvasElement, step);

        await step('clear max input', async () => {
            await userEvent.click(clearMaxButton());
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('10');
                await expect(maxInput()).toHaveValue('');
            });
            await expectEventWithDetail({
                ageFrom: 10,
                ageTo: undefined,
            });
        });

        await step('type a small value into max input and expect that min is shifted accordingly', async () => {
            await userEvent.type(maxInput(), '1');
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('1');
                await expect(maxInput()).toHaveValue('1');
            });
            await expectEventWithDetail({
                ageFrom: 1,
                ageTo: 1,
            });
        });

        await step('type another value into max input', async () => {
            await userEvent.type(maxInput(), '2');
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('1');
                await expect(maxInput()).toHaveValue('12');
            });
            await expectEventWithDetail({
                ageFrom: 1,
                ageTo: 12,
            });
        });
    },
};

async function setup(canvasElement: HTMLElement, step: StepFunction) {
    const canvas = within(canvasElement);

    const changedListenerMock = fn();
    await step('Setup event listener mock', () => {
        canvasElement.addEventListener(gsNumberFilterChangedEventName, changedListenerMock);
    });

    const minInput = () => canvas.getByPlaceholderText('age from');
    const maxInput = () => canvas.getByPlaceholderText('age to');
    const clearMinButton = () => canvas.getByRole('button', { name: 'clear min input' });
    const clearMaxButton = () => canvas.getByRole('button', { name: 'clear max input' });
    const expectEventWithDetail = (detail: { ageFrom?: number; ageTo?: number }) => {
        return waitFor(async () => {
            await expect(changedListenerMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    detail,
                }),
            );
        });
    };

    await step('wait until component has loaded', async () => {
        await waitFor(async () => {
            await expect(minInput()).toBeVisible();
            await expect(clearMinButton()).toBeVisible();
            await expect(minInput()).toHaveValue('10');
            await expect(maxInput()).toHaveValue('90');
        });
    });

    return { expectEventWithDetail, minInput, maxInput, clearMinButton, clearMaxButton };
}
