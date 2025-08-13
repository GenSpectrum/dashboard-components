import { expect, fn, waitFor } from '@storybook/test';

import { gsEventNames } from '../../../utils/gsEventNames';

export function playThatExpectsFinishedLoadingEvent() {
    return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const componentFinishedLoadingListenerMock = fn();
        canvasElement.addEventListener(gsEventNames.componentFinishedLoading, componentFinishedLoadingListenerMock);

        await waitFor(() => expect(componentFinishedLoadingListenerMock).toHaveBeenCalled(), { timeout: 2000 });
    };
}
