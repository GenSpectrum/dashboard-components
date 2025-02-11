import { type ComponentChildren, type FunctionalComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { isNotInitialized, ReferenceGenomeContext } from '../ReferenceGenomeContext';

/**
 * Sometimes the reference genome is not immediately available.
 * This component will display a loading spinner until the reference genome is available.
 * Child components can assume that the reference genome is available on the first render,
 * which e.g. matters for initial values of `useState`.
 */
export const ReferenceGenomesAwaiter: FunctionalComponent<{ children: ComponentChildren }> = ({ children }) => {
    const referenceGenome = useContext(ReferenceGenomeContext);

    if (isNotInitialized(referenceGenome)) {
        return <div className='laoding loading-spinner loading-md'>Loading...</div>;
    }

    return <>{children}</>;
};
