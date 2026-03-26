import { useEffect, useState } from 'preact/hooks';

/**
 * For when state is supplied via an attribute to the web component,
 * and we need to update the internal state when the attribute value changes
 */
export function useControlledState<S>(initialState: S) {
    const [state, setState] = useState(initialState);

    useEffect(() => {
        setState(initialState);
    }, [initialState]);

    return [state, setState] as const;
}
