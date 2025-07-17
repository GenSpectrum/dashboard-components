import { type RenderableProps } from 'preact';
import { useEffect, useErrorBoundary, useMemo } from 'preact/hooks';
import { type ZodSchema } from 'zod';

import { ErrorDisplay, type ErrorDisplayProps, InvalidPropsError } from './error-display';
import { ResizeContainer, type Size } from './resize-container';

export type ErrorBoundaryProps<T> = {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- useErrorBoundary unfortunately returns `[any, ...]`
    const [internalError, resetError] = useErrorBoundary();
    const componentPropsParseError = useCheckComponentProps(schema, componentProps);

    useEffect(
        () => {
            if (internalError) {
                resetError();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this should run if and only if the props of the component change
        [componentProps],
    );

    if (internalError) {
        return (
            <ResizeContainer size={size}>
                <ErrorDisplay error={internalError as Error} resetError={resetError} layout={layout} />
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
        const parseResult = schema.safeParse(componentProps);
        if (parseResult.success) {
            return undefined;
        }

        return new InvalidPropsError(parseResult.error, componentProps);
    }, [componentProps, schema]);
}
