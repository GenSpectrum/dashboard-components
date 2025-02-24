import { type ComponentChildren, type FunctionComponent, type Ref, type RefObject } from 'preact';
import { useRef } from 'preact/hooks';

export type ModalButtonProps = {
    buttonClassName?: string;
    modalContent: ComponentChildren;
};

export const Modal: FunctionComponent<ModalButtonProps> = (props) => {
    const modalRef = useModalRef();

    return <ButtonWithModalDialog {...props} modalRef={modalRef} />;
};

type ButtonWithModalDialogProps = ModalButtonProps & {
    modalRef: RefObject<HTMLDialogElement>;
};

export const ButtonWithModalDialog: FunctionComponent<ButtonWithModalDialogProps> = ({
    children,
    buttonClassName,
    modalContent,
    modalRef,
}) => {
    return (
        <>
            <button type='button' className={buttonClassName} onClick={() => modalRef.current?.showModal()}>
                {children}
            </button>
            <ModalDialog modalRef={modalRef}>{modalContent}</ModalDialog>
        </>
    );
};

export function useModalRef() {
    return useRef<HTMLDialogElement>(null);
}

export type ModalProps = {
    modalRef: Ref<HTMLDialogElement>;
};

export const ModalDialog: FunctionComponent<ModalProps> = ({ children, modalRef }) => {
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
