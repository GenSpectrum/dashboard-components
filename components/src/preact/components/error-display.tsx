import { type FunctionComponent } from 'preact';

export const ErrorDisplay: FunctionComponent<{ error: Error }> = ({ error }) => {
    return <div>Error: {error.message}</div>;
};
