import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';
import { type FunctionComponent } from 'preact';

import { Modal, type ModalProps, useModalRef } from './modal';

const meta: Meta<ModalProps> = {
    title: 'Component/Modal',
    component: Modal,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithButtonThatOpensTheModal: FunctionComponent = () => {
    const modalRef = useModalRef();

    return (
        <div>
            <button className='btn' onClick={() => modalRef.current?.showModal()}>
                Open modal
            </button>
            <Modal modalRef={modalRef}>
                <h1>Modal content</h1>
            </Modal>
        </div>
    );
};

export const ModalStory: StoryObj<ModalProps> = {
    render: () => {
        return <WrapperWithButtonThatOpensTheModal />;
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
