import { FunctionComponent } from 'preact';

export interface HeadlineProps {
    heading: string;
}

const Headline: FunctionComponent<HeadlineProps> = ({ heading, children }) => {
    return (
        <>
            <h1>{heading}</h1>
            {children}
        </>
    );
};

export default Headline;
