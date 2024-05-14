import type { FunctionComponent } from 'preact';
import { useErrorBoundary } from 'preact/hooks';

import { ErrorDisplay } from './error-display';
import { ResizeContainer, type Size } from './resize-container';
import Headline from '../components/headline';

export const ErrorBoundary: FunctionComponent<{ size?: Size; defaultSize: Size; headline?: string }> = ({
    size,
    defaultSize,
    headline,
    children,
}) => {
    const [internalError] = useErrorBoundary();

    if (internalError) {
        console.error(internalError);
    }

    if (internalError) {
        return (
            <ResizeContainer defaultSize={defaultSize} size={size}>
                <Headline heading={headline}>
                    <ErrorDisplay error={internalError} />
                </Headline>
            </ResizeContainer>
        );
    }

    return <>{children}</>;
};
