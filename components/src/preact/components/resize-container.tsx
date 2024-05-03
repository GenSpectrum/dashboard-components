import { type FunctionComponent } from 'preact';

export type Size = {
    width?: string;
    height?: string;
};

export interface ResizeContainerProps {
    size?: Size;
    defaultSize: Size;
}

export const ResizeContainer: FunctionComponent<ResizeContainerProps> = ({ children, size, defaultSize }) => {
    return <div style={extendByDefault(size, defaultSize)}>{children}</div>;
};

const extendByDefault = (size: Size | undefined, defaultSize: Size) => {
    if (size === undefined) {
        return defaultSize;
    }

    return { ...defaultSize, ...size };
};
