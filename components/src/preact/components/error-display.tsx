import { type FunctionComponent } from 'preact';

export class UserFacingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserFacingError';
    }
}

export const ErrorDisplay: FunctionComponent<{ error: Error }> = ({ error }) => {
    return (
        <div className='h-full w-full rounded-md border-2 border-gray-100 p-2 flex items-center justify-center flex-col'>
            <div className='text-red-700 font-bold'>Error</div>
            <div>Oops! Something went wrong.</div>
            {error instanceof UserFacingError && <div className='text-sm text-gray-600'>{error.message}</div>}
        </div>
    );
};
