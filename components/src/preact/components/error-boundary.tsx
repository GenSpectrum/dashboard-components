import type { FunctionComponent } from 'preact';
import { useErrorBoundary } from 'preact/hooks';

import { ErrorDisplay } from './error-display';
import { ResizeContainer, type Size } from './resize-container';

export const ErrorBoundary: FunctionComponent<{ size: Size }> = ({ size, children }) => {
    const [internalError] = useErrorBoundary();

    if (internalError) {
        return (
            <ResizeContainer size={size}>
                <ErrorDisplay error={internalError} />
            </ResizeContainer>
        );
    }

    return <>{children}</>;
};
