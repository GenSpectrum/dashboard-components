import type { FunctionComponent } from 'preact';
import { useErrorBoundary } from 'preact/hooks';

import { ErrorDisplay, type ErrorDisplayProps } from './error-display';
import { ResizeContainer, type Size } from './resize-container';

type ErrorBoundaryProps = {
    size: Size;
    layout?: ErrorDisplayProps['layout'];
};

export const ErrorBoundary: FunctionComponent<ErrorBoundaryProps> = ({ size, layout, children }) => {
    const [internalError, resetError] = useErrorBoundary();

    if (internalError) {
        return (
            <ResizeContainer size={size}>
                <ErrorDisplay error={internalError} resetError={resetError} layout={layout} />
            </ResizeContainer>
        );
    }

    return <>{children}</>;
};
