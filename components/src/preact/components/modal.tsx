import { type FunctionComponent, type Ref } from 'preact';
import { useRef } from 'preact/hooks';

export type ModalProps = {
    modalRef: Ref<HTMLDialogElement>;
};

export function useModalRef() {
    return useRef<HTMLDialogElement>(null);
}

export const Modal: FunctionComponent<ModalProps> = ({ children, modalRef }) => {
    return (
        <dialog ref={modalRef} className={'modal modal-bottom sm:modal-middle'}>
            <div className='modal-box sm:max-w-5xl'>
                <form method='dialog'>
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>
                <div className={'flex flex-col'}>{children}</div>
                <div className='modal-action'>
                    <form method='dialog'>
                        <button className={'float-right underline text-sm hover:text-blue-700 mr-2'}>Close</button>
                    </form>
                </div>
            </div>
            <form method='dialog' className='modal-backdrop'>
                <button>Helper to close when clicked outside</button>
            </form>
        </dialog>
    );
};
