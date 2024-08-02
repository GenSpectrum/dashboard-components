import { type FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

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

export const ErrorDisplay: FunctionComponent<{ error: Error }> = ({ error }) => {
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
            className='h-full w-full rounded-md border-2 border-gray-100 p-2 flex items-center justify-center flex-col'
        >
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

    return { headline: 'Error', details: undefined };
}
