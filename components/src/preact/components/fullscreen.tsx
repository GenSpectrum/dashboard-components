import { useEffect, useRef, useState } from 'preact/hooks';

export const Fullscreen = () => {
    const element = useRef<HTMLButtonElement>(null);
    const isFullscreen = useFullscreenStatus();
    return (
        <button
            ref={element}
            onClick={() => {
                if (element.current) {
                    if (isFullscreen) {
                        void document.exitFullscreen();
                    } else {
                        const componentRoot = findComponentRoot(element.current);
                        if (componentRoot) {
                            void componentRoot.requestFullscreen();
                        }
                    }
                }
            }}
            className={`mt-0.5 iconify text-2xl ${isFullscreen ? 'mdi--fullscreen-exit hover:scale-90' : 'mdi--fullscreen hover:scale-110'}`}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        />
    );
};

function findComponentRoot(element: HTMLElement) {
    return findShadowRoot(element)?.children[0];
}

function findShadowRoot(element: HTMLElement) {
    let current: Node = element;
    while (current) {
        if (current instanceof ShadowRoot) {
            return current;
        }
        if (current.parentNode === null) {
            return null;
        }
        current = current.parentNode;
    }
    return null;
}

function useFullscreenStatus(): boolean {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(document.fullscreenElement !== null);
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement !== null);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);
    return isFullscreen;
}
