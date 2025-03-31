import { createContext, type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useContext, useState } from 'preact/hooks';

import type { PageSizes } from './pagination';

type PageSizeContext = {
    pageSize: number;
    setPageSize: Dispatch<StateUpdater<number>>;
};

const pageSizeContext = createContext<PageSizeContext>({
    pageSize: -1,
    setPageSize: () => {
        throw new Error('pageSizeContext not initialized');
    },
});

export function usePageSizeContext() {
    return useContext(pageSizeContext);
}

export type PageSizeContextProviderProps = {
    pageSizes: PageSizes;
};

export const PageSizeContextProvider: FunctionComponent<PageSizeContextProviderProps> = ({ children, pageSizes }) => {
    const [pageSize, setPageSize] = useState(typeof pageSizes === 'number' ? pageSizes : (pageSizes.at(0) ?? 10));

    return <pageSizeContext.Provider value={{ pageSize, setPageSize }}>{children}</pageSizeContext.Provider>;
};
