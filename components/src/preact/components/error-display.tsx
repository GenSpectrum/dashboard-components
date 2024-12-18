import { type FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { type ZodError } from 'zod';

import { InfoHeadline1, InfoParagraph } from './info';
import { Modal, useModalRef } from './modal';
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
    const modalRef = useModalRef();

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
                            <button
                                className='underline hover:text-gray-400'
                                onClick={() => modalRef.current?.showModal()}
                            >
                                Show details.
                            </button>
                            <Modal modalRef={modalRef}>
                                <InfoHeadline1>{details.headline}</InfoHeadline1>
                                <InfoParagraph>{details.message}</InfoParagraph>
                            </Modal>
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
        return {
            headline: 'Error - Invalid component attributes',
            details: { headline: 'Invalid component attributes', message: <ZodErrorDetails error={error} /> },
        };
    }

    return { headline: 'Error', details: undefined };
}

function ZodErrorDetails({ error }: { error: InvalidPropsError }) {
    const firstError = error.zodError.errors[0];
    return (
        <>
            <p>
                <span className='font-bold'>You are a regular user?</span> Unfortunately, there is nothing you can do at
                the moment. This component is misconfigured. Please contact the administrator of this page.
            </p>
            <p>
                <span className='font-bold'>You are the administrator of this page?</span> You supplied invalid
                attributes to this component. Please check the browser console for more detailed error messages.
            </p>
            {firstError.code === 'invalid_type' && firstError.received === 'null' && (
                <p>
                    Is the "{firstError.path[0]}" attribute in the HTML of the correct type? The attribute is expected
                    to be of type "{firstError.expected}".
                </p>
            )}
            <p>This is a summary of the unexpected attribute values:</p>
            <ul class='m-4 list-outside list-disc '>
                {error.zodError.issues.map((issue, index) => {
                    const actual =
                        issue.path[0] in error.componentProps
                            ? `'${JSON.stringify(error.componentProps[issue.path[0]])}'`
                            : '';
                    return (
                        <li key={index}>
                            Unexpected value {actual} for "{issue.path.join('.')}": {issue.message}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
