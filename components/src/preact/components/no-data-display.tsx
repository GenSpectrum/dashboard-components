import { type FunctionComponent } from 'preact';

export const NoDataDisplay: FunctionComponent = () => {
    return (
        <div className='h-full w-full rounded-md border-2 border-gray-100 p-2 flex items-center justify-center'>
            <div>No data available.</div>
        </div>
    );
};
