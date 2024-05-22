import { offset, shift, size } from '@floating-ui/dom';
import { type FunctionComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { dropdownClass } from './dropdown';
import { useCloseOnClickOutside, useCloseOnEsc, useFloatingUi } from '../shared/floating-ui/hooks';

export interface InfoProps {
    height?: string;
}

const Info: FunctionComponent<InfoProps> = ({ children, height }) => {
    const [showHelp, setShowHelp] = useState(false);
    const referenceRef = useRef<HTMLButtonElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);

    useFloatingUi(referenceRef, floatingRef, [
        offset(10),
        shift(),
        size({
            apply() {
                if (!floatingRef.current) {
                    return;
                }
                floatingRef.current.style.width = '100vw';
                floatingRef.current.style.height = height ? height : '50vh';
            },
        }),
    ]);

    const toggleHelp = () => {
        setShowHelp(!showHelp);
    };

    useCloseOnEsc(setShowHelp);
    useCloseOnClickOutside(floatingRef, referenceRef, setShowHelp);

    return (
        <div className='relative'>
            <button type='button' className='btn btn-xs' onClick={toggleHelp} ref={referenceRef}>
                ?
            </button>
            <div
                ref={floatingRef}
                className={`${dropdownClass} overflow-y-auto opacity-90 ${showHelp ? '' : 'hidden'}`}
            >
                <div className={'flex flex-col'}>{children}</div>
                <button
                    onClick={() => setShowHelp(false)}
                    className={'float-right underline text-sm hover:text-blue-700 mr-2'}
                >
                    Close
                </button>
            </div>
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
