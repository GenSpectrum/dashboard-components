import { type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

export interface HeadlineProps {
    heading?: string;
}

const Headline: FunctionComponent<HeadlineProps> = ({ heading, children }) => {
    if (!heading) {
        return <>{children}</>;
    }

    return <ResizingHeadline heading={heading}>{children}</ResizingHeadline>;
};

const ResizingHeadline: FunctionComponent<HeadlineProps> = ({ heading, children }) => {
    const ref = useRef<HTMLHeadingElement>(null);

    const [h1Height, setH1Height] = useState('2rem');

    useEffect(() => {
        if (ref.current) {
            const h1Height = ref.current.getBoundingClientRect().height;
            setH1Height(`${h1Height}px`);
        }
    }, []);

    return (
        <div className='h-full w-full'>
            <h1 ref={ref}>{heading}</h1>
            <div style={{ height: `calc(100% - ${h1Height})` }}>{children}</div>
        </div>
    );
};

export default Headline;
