import { type RenderableProps } from 'preact';
import { useErrorBoundary, useMemo } from 'preact/hooks';
import { type ZodSchema } from 'zod';

import { ErrorDisplay, type ErrorDisplayProps, InvalidPropsError } from './error-display';
import { ResizeContainer, type Size } from './resize-container';

type ErrorBoundaryProps<T> = {
    size: Size;
    componentProps: T;
    schema: ZodSchema<T>;
    layout?: ErrorDisplayProps['layout'];
};

export const ErrorBoundary = <T extends Record<string, unknown>>({
    size,
    layout,
    componentProps,
    schema,
    children,
}: RenderableProps<ErrorBoundaryProps<T>>) => {
    const [internalError, resetError] = useErrorBoundary();
    const componentPropsParseError = useCheckComponentProps(schema, componentProps);

    if (internalError) {
        return (
            <ResizeContainer size={size}>
                <ErrorDisplay error={internalError} resetError={resetError} layout={layout} />
            </ResizeContainer>
        );
    }

    if (componentPropsParseError !== undefined) {
        return (
            <ResizeContainer size={size}>
                <ErrorDisplay error={componentPropsParseError} layout={layout} />
            </ResizeContainer>
        );
    }

    return <>{children}</>;
};

function useCheckComponentProps<T extends Record<string, unknown>>(schema: ZodSchema<T>, componentProps: T) {
    return useMemo(() => {
        if (schema === undefined || componentProps === undefined) {
            return undefined;
        }

        const parseResult = schema.safeParse(componentProps);
        if (parseResult.success) {
            return undefined;
        }

        return new InvalidPropsError(parseResult.error, componentProps);
    }, [componentProps, schema]);
}
