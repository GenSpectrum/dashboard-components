import { type FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { type ZodError } from 'zod';

import { LapisError, UnknownLapisError } from '../../lapisApi/lapisApi';

export const GS_ERROR_EVENT_TYPE = 'gs-error';

export class ErrorEvent extends Event {
    constructor(public readonly error: Error) {
        super(GS_ERROR_EVENT_TYPE, {
            bubbles: true,
            composed: true,
        });
    }
}

export class UserFacingError extends Error {
    constructor(
        public readonly headline: string,
        message: string,
    ) {
        super(message);
        this.name = 'UserFacingError';
    }
}

export class InvalidPropsError extends Error {
    constructor(
        public readonly zodError: ZodError,
        public readonly componentProps: Record<string, unknown>,
    ) {
        super(zodError.message);
        this.name = 'InvalidPropsError';
    }
}

export type ErrorDisplayProps = {
    error: Error;
    resetError?: () => void;
    layout?: 'horizontal' | 'vertical';
};

export const ErrorDisplay: FunctionComponent<ErrorDisplayProps> = ({ error, resetError, layout }) => {
    // eslint-disable-next-line no-console -- Currently we use the following statement for our error handling
    console.error(error);

    const containerRef = useRef<HTMLInputElement>(null);
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        containerRef.current?.dispatchEvent(new ErrorEvent(error));
    });

    const { headline, details } = getDisplayedErrorMessage(error);

    return (
        <div
            ref={containerRef}
            className={`h-full w-full rounded-md border-2 border-gray-100 p-2 flex items-center justify-center ${layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}
        >
            <div>
                <div className='text-red-700 font-bold'>{headline}</div>
                <div>
                    Oops! Something went wrong.
                    {details !== undefined && (
                        <>
                            {' '}
                            <button className='underline hover:text-gray-400' onClick={() => ref.current?.showModal()}>
                                Show details.
                            </button>
                            <dialog ref={ref} class='modal'>
                                <div class='modal-box'>
                                    <form method='dialog'>
                                        <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
                                            ✕
                                        </button>
                                    </form>
                                    <h1 class='text-lg'>{details.headline}</h1>
                                    <p class='py-4'>{details.message}</p>
                                </div>
                                <form method='dialog' class='modal-backdrop'>
                                    <button>close</button>
                                </form>
                            </dialog>
                        </>
                    )}
                </div>
            </div>
            {resetError !== undefined && (
                <button onClick={resetError} className='btn btn-sm flex items-center m-4'>
                    <span className='iconify mdi--reload text-lg' />
                    Try again
                </button>
            )}
        </div>
    );
};

function getDisplayedErrorMessage(error: Error) {
    if (error instanceof UserFacingError) {
        return {
            headline: `Error - ${error.headline}`,
            details: {
                headline: error.headline,
                message: error.message,
            },
        };
    }

    if (error instanceof LapisError) {
        return {
            headline: `Error - Failed fetching ${error.requestedData} from LAPIS`,
            details: {
                headline: `LAPIS request failed: ${error.requestedData} - ${error.problemDetail.status} ${error.problemDetail.title}`,
                message: error.problemDetail.detail ?? error.message,
            },
        };
    }

    if (error instanceof UnknownLapisError) {
        return {
            headline: `Error - Failed fetching ${error.requestedData} from LAPIS`,
            details: {
                headline: `LAPIS request failed: An unexpected error occurred while fetching ${error.requestedData}`,
                message: error.message,
            },
        };
    }

    if (error instanceof InvalidPropsError) {
        const firstError = error.zodError.errors[0];
        let message = error.zodError.issues
            .map((issue) => {
                const actual =
                    issue.path[0] in error.componentProps
                        ? ` '${JSON.stringify(error.componentProps[issue.path[0]])}'`
                        : '';
                return `Unexpected value${actual} for "${issue.path.join('.')}": ${issue.message}`;
            })
            .join(' - ');

        if (firstError.code === 'invalid_type' && firstError.received === 'null') {
            message = `Is the "${firstError.path[0]}" attribute in the HTML of the correct type? ${message}`;
        }

        return {
            headline: 'Error - Invalid component attributes',
            details: { headline: 'Invalid component attributes', message },
        };
    }

    return { headline: 'Error', details: undefined };
}
