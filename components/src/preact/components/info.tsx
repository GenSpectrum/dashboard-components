import { autoUpdate, computePosition, offset, shift, size } from '@floating-ui/dom';
import { type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { type MutableRefObject } from 'react';

export interface InfoProps {
    height?: string;
}

const Info: FunctionComponent<InfoProps> = ({ children, height }) => {
    const [showHelp, setShowHelp] = useState(false);
    const referenceRef = useRef<HTMLButtonElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);

    useFloatingUi(referenceRef, floatingRef, height, showHelp);

    const toggleHelp = () => {
        setShowHelp(!showHelp);
    };

    useCloseOnEsc(setShowHelp);
    useCloseOnClickOutside(floatingRef, referenceRef, setShowHelp);

    return (
        <div className='relative z-10'>
            <button type='button' className='btn btn-xs' onClick={toggleHelp} ref={referenceRef}>
                ?
            </button>
            <div
                ref={floatingRef}
                className='bg-white p-2 border border-gray-100 shadow-lg rounded overflow-y-auto opacity-90'
                style={{ position: 'absolute', zIndex: 10, display: showHelp ? '' : 'none' }}
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

function useFloatingUi(
    referenceRef: MutableRefObject<HTMLButtonElement | null>,
    floatingRef: MutableRefObject<HTMLDivElement | null>,
    height: string | undefined,
    showHelp: boolean,
) {
    const cleanupRef = useRef<Function | null>(null);

    useEffect(() => {
        if (!referenceRef.current || !floatingRef.current) {
            return;
        }

        const { current: reference } = referenceRef;
        const { current: floating } = floatingRef;

        const update = () => {
            computePosition(reference, floating, {
                middleware: [
                    offset(10),
                    shift(),
                    size({
                        apply({}) {
                            floating.style.width = '100vw';
                            floating.style.height = height ? height : '50vh';
                        },
                    }),
                ],
            }).then(({ x, y }) => {
                floating.style.left = `${x}px`;
                floating.style.top = `${y}px`;
            });
        };

        update();
        cleanupRef.current = autoUpdate(reference, floating, update);

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, [showHelp, height, referenceRef, floatingRef]);
}

function useCloseOnClickOutside(
    floatingRef: MutableRefObject<HTMLDivElement | null>,
    referenceRef: MutableRefObject<HTMLButtonElement | null>,
    setShowHelp: (value: ((prevState: boolean) => boolean) | boolean) => void,
) {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const path = event.composedPath();
            if (
                floatingRef.current &&
                !path.includes(floatingRef.current) &&
                referenceRef.current &&
                !path.includes(referenceRef.current)
            ) {
                setShowHelp(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [floatingRef, referenceRef, setShowHelp]);
}

function useCloseOnEsc(setShowHelp: (value: ((prevState: boolean) => boolean) | boolean) => void) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowHelp(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setShowHelp]);
}

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
