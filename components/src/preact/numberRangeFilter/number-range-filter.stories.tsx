import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { type StepFunction } from '@storybook/types';
import { useEffect, useRef, useState } from 'preact/hooks';

import { type NumberRange } from './NumberRangeFilterChangedEvent';
import { NumberRangeFilter, type NumberRangeFilterProps } from './number-range-filter';
import { gsEventNames } from '../../utils/gsEventNames';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta<NumberRangeFilterProps> = {
    title: 'Input/Number range filter',
    component: NumberRangeFilter,
    parameters: {
        fetchMock: {},
        actions: {
            handles: [gsEventNames.numberRangeFilterChanged, gsEventNames.numberRangeValueChanged],
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
        sliderMin: {
            control: {
                type: 'number',
            },
        },
        sliderMax: {
            control: {
                type: 'number',
            },
        },
        sliderStep: {
            control: {
                type: 'number',
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

const Template: StoryObj<NumberRangeFilterProps> = {
    render: (args) => <NumberRangeFilter {...args} />,
    args: {
        lapisField: 'age',
        value: { min: 10, max: 90 },
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 0.1,
        width: '100%',
    },
};

export const SetMinValue: StoryObj<NumberRangeFilterProps> = {
    ...Template,
    play: async ({ canvasElement, step }) => {
        const {
            filterChangedListenerMock,
            valueChangedListenerMock,
            expectFilterEventWithDetail,
            expectValueEventWithDetail,
            minInput,
            maxInput,
            clearMinButton,
        } = await setup(canvasElement, step);

        async function changeFocus() {
            await userEvent.click(maxInput());
        }

        await step('clear min input', async () => {
            await userEvent.click(clearMinButton());
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('');
                await expect(maxInput()).toHaveValue('90');
            });
            await expectFilterEventWithDetail({
                ageFrom: undefined,
                ageTo: 90,
            });
            await expectValueEventWithDetail({
                min: undefined,
                max: 90,
            });
        });

        await step('type a value into min input', async () => {
            await userEvent.type(minInput(), '9');
            await changeFocus();
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('9');
                await expect(maxInput()).toHaveValue('90');
            });
            await expectFilterEventWithDetail({
                ageFrom: 9,
                ageTo: 90,
            });
            await expectValueEventWithDetail({
                min: 9,
                max: 90,
            });
        });

        await step('make min input larger than max input and check that no event it dispatched', async () => {
            filterChangedListenerMock.mockClear();
            valueChangedListenerMock.mockClear();
            await userEvent.type(minInput(), '8');
            await changeFocus();
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('98');
                await expect(maxInput()).toHaveValue('90');
            });
            await expect(filterChangedListenerMock).not.toHaveBeenCalled();
            await expect(valueChangedListenerMock).not.toHaveBeenCalled();
        });
    },
};

export const SetMaxValue: StoryObj<NumberRangeFilterProps> = {
    ...Template,
    play: async ({ canvasElement, step }) => {
        const {
            filterChangedListenerMock,
            valueChangedListenerMock,
            expectFilterEventWithDetail,
            expectValueEventWithDetail,
            minInput,
            maxInput,
            clearMaxButton,
        } = await setup(canvasElement, step);

        async function changeFocus() {
            await userEvent.click(minInput());
        }

        await step('clear max input', async () => {
            await userEvent.click(clearMaxButton());
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('10');
                await expect(maxInput()).toHaveValue('');
            });
            await expectFilterEventWithDetail({
                ageFrom: 10,
                ageTo: undefined,
            });
            await expectValueEventWithDetail({
                min: 10,
                max: undefined,
            });
        });

        await step('type a smaller value than min into max input and check that no event is dispatched', async () => {
            filterChangedListenerMock.mockClear();
            valueChangedListenerMock.mockClear();
            await userEvent.type(maxInput(), '1');
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('10');
                await expect(maxInput()).toHaveValue('1');
            });
            await expect(filterChangedListenerMock).not.toHaveBeenCalled();
            await expect(valueChangedListenerMock).not.toHaveBeenCalled();
        });

        await step('type another value into max input', async () => {
            await userEvent.type(maxInput(), '2');
            await changeFocus();
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('10');
                await expect(maxInput()).toHaveValue('12');
            });
            await expectFilterEventWithDetail({
                ageFrom: 10,
                ageTo: 12,
            });
            await expectValueEventWithDetail({
                min: 10,
                max: 12,
            });
        });
    },
};

export const TypeInvalidNumbers: StoryObj<NumberRangeFilterProps> = {
    ...Template,
    play: async ({ canvasElement, step }) => {
        const { filterChangedListenerMock, valueChangedListenerMock, minInput, maxInput, clearMaxButton } = await setup(
            canvasElement,
            step,
        );

        await step('clear max input', async () => {
            await userEvent.click(clearMaxButton());
            await waitFor(() => expect(filterChangedListenerMock).toHaveBeenCalled());
            await waitFor(() => expect(valueChangedListenerMock).toHaveBeenCalled());
            filterChangedListenerMock.mockClear();
            valueChangedListenerMock.mockClear();
        });

        await step('type invalid number into input field', async () => {
            await expect(minInput()).toBeValid();
            await expect(maxInput()).toBeValid();
            await userEvent.type(maxInput(), 'not a number');
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('10');
                await expect(maxInput()).toHaveValue('not a number');
                await expect(minInput()).toBeInvalid();
                await expect(maxInput()).toBeInvalid();
            });
            await expect(filterChangedListenerMock).not.toHaveBeenCalled();
            await expect(valueChangedListenerMock).not.toHaveBeenCalled();
        });

        await step('clear invalid input from input field', async () => {
            await expect(clearMaxButton()).toBeVisible();
            await userEvent.click(clearMaxButton());
            await waitFor(async () => {
                await expect(minInput()).toHaveValue('10');
                await expect(maxInput()).toHaveValue('');
                await expect(minInput()).toBeValid();
                await expect(maxInput()).toBeValid();
            });
        });
    },
};

export const WithInvalidProps: StoryObj<NumberRangeFilterProps> = {
    ...Template,
    args: {
        ...Template.args,
        lapisField: '',
    },
    play: async ({ canvasElement, step }) => {
        await step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};

export const ChangingTheValueProgrammatically: StoryObj<NumberRangeFilterProps> = {
    ...Template,
    render: (args) => {
        const StatefulWrapper = () => {
            const [value, setValue] = useState<NumberRange>({
                min: 10,
                max: 90,
            });
            const ref = useRef<HTMLDivElement>(null);

            useEffect(() => {
                ref.current?.addEventListener(gsEventNames.numberRangeValueChanged, (event) => {
                    setValue(event.detail);
                });
            }, []);
            return (
                <div ref={ref}>
                    <NumberRangeFilter {...args} value={value} />
                    <button className='btn' onClick={() => setValue((prev) => ({ ...prev, min: 30 }))}>
                        Set min to 30
                    </button>
                    <button className='btn' onClick={() => setValue((prev) => ({ ...prev, max: 40 }))}>
                        Set max to 40
                    </button>
                </div>
            );
        };

        return <StatefulWrapper />;
    },
    play: async ({ canvasElement, step, canvas }) => {
        const {
            filterChangedListenerMock,
            valueChangedListenerMock,
            expectFilterEventWithDetail,
            expectValueEventWithDetail,
            minInput,
            maxInput,
            clearMaxButton,
        } = await setup(canvasElement, step);

        await waitFor(async () => {
            await expect(minInput()).toHaveValue('10');
            await expect(maxInput()).toHaveValue('90');
        });

        await userEvent.click(canvas.getByRole('button', { name: 'Set min to 30' }));
        await waitFor(async () => {
            await expect(minInput()).toHaveValue('30');
            await expect(maxInput()).toHaveValue('90');
        });
        await expect(filterChangedListenerMock).not.toHaveBeenCalled();
        await expect(valueChangedListenerMock).not.toHaveBeenCalled();

        await userEvent.click(canvas.getByRole('button', { name: 'Set max to 40' }));
        await waitFor(async () => {
            await expect(minInput()).toHaveValue('30');
            await expect(maxInput()).toHaveValue('40');
        });
        await expect(filterChangedListenerMock).not.toHaveBeenCalled();
        await expect(valueChangedListenerMock).not.toHaveBeenCalled();

        await userEvent.click(clearMaxButton());
        await waitFor(async () => {
            await expect(minInput()).toHaveValue('30');
            await expect(maxInput()).toHaveValue('');
        });
        await expectFilterEventWithDetail({ ageFrom: 30, ageTo: undefined });
        await expectValueEventWithDetail({ min: 30, max: undefined });

        await userEvent.click(canvas.getByRole('button', { name: 'Set max to 40' }));
        await waitFor(async () => {
            await expect(minInput()).toHaveValue('30');
            await expect(maxInput()).toHaveValue('40');
        });
    },
};

async function setup(canvasElement: HTMLElement, step: StepFunction) {
    const canvas = within(canvasElement);

    const filterChangedListenerMock = fn();
    const valueChangedListenerMock = fn();
    await step('Setup event listener mock', () => {
        canvasElement.addEventListener(gsEventNames.numberRangeFilterChanged, filterChangedListenerMock);
        canvasElement.addEventListener(gsEventNames.numberRangeValueChanged, valueChangedListenerMock);
    });

    const minInput = () => canvas.getByPlaceholderText('age from');
    const maxInput = () => canvas.getByPlaceholderText('age to');
    const clearMinButton = () => canvas.getByRole('button', { name: 'clear min input' });
    const clearMaxButton = () => canvas.getByRole('button', { name: 'clear max input' });
    const expectFilterEventWithDetail = (detail: { ageFrom?: number; ageTo?: number }) => {
        return waitFor(async () => {
            await expect(filterChangedListenerMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    detail,
                }),
            );
        });
    };
    const expectValueEventWithDetail = (detail: NumberRange) => {
        return waitFor(async () => {
            await expect(valueChangedListenerMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    detail,
                }),
            );
        });
    };

    await step('wait until component has loaded', async () => {
        await waitFor(async () => {
            await expect(minInput()).toBeVisible();
            await expect(maxInput()).toBeVisible();
            await expect(minInput()).toHaveValue('10');
            await expect(maxInput()).toHaveValue('90');
        });
    });

    return {
        filterChangedListenerMock,
        valueChangedListenerMock,
        expectFilterEventWithDetail,
        expectValueEventWithDetail,
        minInput,
        maxInput,
        clearMinButton,
        clearMaxButton,
    };
}
