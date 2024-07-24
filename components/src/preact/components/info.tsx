import { type FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';

export interface InfoProps {}

const Info: FunctionComponent<InfoProps> = ({ children }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const toggleHelp = () => {
        dialogRef.current?.showModal();
    };

    return (
        <div className='relative'>
            <button type='button' className='btn btn-xs' onClick={toggleHelp}>
                ?
            </button>
            <dialog ref={dialogRef} className={'modal modal-bottom sm:modal-middle'}>
                <div className='modal-box'>
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
        </div>
    );
};

export const InfoHeadline1: FunctionComponent = ({ children }) => {
    return <h1 className='text-lg font-bold'>{children}</h1>;
};

export const InfoHeadline2: FunctionComponent = ({ children }) => {
    return <h2 className='text-base font-bold mt-4'>{children}</h2>;
};

export const InfoParagraph: FunctionComponent = ({ children }) => {
    return <p className='text-justify my-1'>{children}</p>;
};

export const InfoLink: FunctionComponent<{ href: string }> = ({ children, href }) => {
    return (
        <a className='text-blue-600 hover:text-blue-800' href={href} target='_blank' rel='noopener noreferrer'>
            {children}
        </a>
    );
};

export default Info;
