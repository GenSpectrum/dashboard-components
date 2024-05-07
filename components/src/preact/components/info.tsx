import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

export interface InfoProps {
    size?: {
        height?: string;
        width?: string;
    };
}

const Info: FunctionComponent<InfoProps> = ({ children, size }) => {
    const [showHelp, setShowHelp] = useState(false);

    const toggleHelp = () => {
        setShowHelp(!showHelp);
    };

    return (
        <div className='relative'>
            <button className='btn btn-xs' onClick={toggleHelp}>
                ?
            </button>
            {showHelp && (
                <div
                    className='absolute top-8 right-6 bg-white p-2 border border-black flex flex-col overflow-auto shadow-lg rounded z-50'
                    style={size}
                >
                    <div className='flex flex-col'>{children}</div>
                    <div className='flex justify-end'>
                        <button className='text-sm underline mt-2' onClick={toggleHelp}>
                            Close
                        </button>
                    </div>
                </div>
            )}
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
