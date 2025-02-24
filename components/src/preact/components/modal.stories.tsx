import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import { Modal, ModalDialog, type ModalProps } from './modal';

const meta: Meta<ModalProps> = {
    title: 'Component/Modal',
    component: ModalDialog,
    parameters: { fetchMock: {} },
};

export default meta;

export const ModalStory: StoryObj<ModalProps> = {
    render: () => {
        return (
            <Modal buttonClassName='btn' modalContent={<h1>Modal content</h1>}>
                Open modal
            </Modal>
        );
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Open the modal', async () => {
            const button = canvas.getByText('Open modal');
            button.click();

            await waitFor(() => expect(canvas.getByText('Modal content')).toBeVisible());
        });
    },
};
