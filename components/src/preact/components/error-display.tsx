import { type FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';

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

    const ref = useRef<HTMLDialogElement>(null);

    return (
        <div className='h-full w-full rounded-md border-2 border-gray-100 p-2 flex items-center justify-center flex-col'>
            <div className='text-red-700 font-bold'>Error</div>
            <div>
                Oops! Something went wrong.
                {error instanceof UserFacingError && (
                    <>
                        {' '}
                        <button
                            className='text-sm text-gray-600 hover:text-gray-300'
                            onClick={() => ref.current?.showModal()}
                        >
                            Show details.
                        </button>
                        <dialog ref={ref} class='modal'>
                            <div class='modal-box'>
                                <form method='dialog'>
                                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
                                        ✕
                                    </button>
                                </form>
                                <h1 class='text-lg'>{error.headline}</h1>
                                <p class='py-4'>{error.message}</p>
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
