import { useEffect, useRef } from 'preact/hooks';

import { gsEventNames } from './gsEventNames';

export function useDispatchFinishedLoadingEvent() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current === null) {
            return;
        }

        ref.current.dispatchEvent(
            new CustomEvent(gsEventNames.componentFinishedLoading, { bubbles: true, composed: true }),
        );
    }, [ref]);

    return ref;
}
