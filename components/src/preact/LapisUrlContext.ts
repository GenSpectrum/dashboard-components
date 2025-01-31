import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

const LapisUrlContext = createContext('');

export const LapisUrlContextProvider = LapisUrlContext.Provider;

export const useLapisUrl = () => {
    const lapisUrl = useContext(LapisUrlContext);

    if (lapisUrl.endsWith('/')) {
        return lapisUrl.slice(0, -1);
    }

    return lapisUrl;
};
