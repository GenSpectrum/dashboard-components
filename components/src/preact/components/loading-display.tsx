import { type FunctionComponent } from 'preact';

export const LoadingDisplay: FunctionComponent = () => {
    return <div aria-label={'Loading'} className='h-full w-full skeleton' />;
};
