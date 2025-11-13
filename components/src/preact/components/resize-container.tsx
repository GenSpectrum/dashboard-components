import { type ComponentChildren } from 'preact';
import { forwardRef } from 'preact/compat';

export type Size = {
    width: string;
    height?: string;
    minHeight?: string;
};

export const ResizeContainer = forwardRef<HTMLDivElement, { size: Size; children: ComponentChildren }>(
    ({ size, children }, ref) => (
        <div
            ref={ref}
            style={{ width: size.width, height: size.height, minHeight: size.minHeight, position: 'relative' }}
        >
            {children}
        </div>
    ),
);
