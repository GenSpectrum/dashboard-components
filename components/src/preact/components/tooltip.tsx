import { computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom';
import { type FunctionComponent } from 'preact';
import { createPortal, type CSSProperties } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { type JSXInternal } from 'preact/src/jsx';

export type TooltipPosition =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'right';

export type TooltipProps = {
    content: string | JSXInternal.Element;
    position?: TooltipPosition;
    tooltipStyle?: CSSProperties;
};

const Tooltip: FunctionComponent<TooltipProps> = ({ children, content, position = 'bottom', tooltipStyle }) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isHovered || !triggerRef.current || !tooltipRef.current) {
            return;
        }

        const updatePosition = async () => {
            if (!triggerRef.current || !tooltipRef.current) {
                return;
            }

            const { x, y } = await computePosition(triggerRef.current, tooltipRef.current, {
                placement: position ?? 'bottom',
                middleware: [
                    offset(8), // 8px gap between trigger and tooltip
                    flip(), // Flip to opposite side if no space
                    shift({ padding: 8 }), // Shift along the axis to keep it in view
                ],
            });

            setTooltipPosition({ x, y });
        };

        updatePosition();
    }, [isHovered, position]);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
            </div>
            {isHovered &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transform: `translate(${Math.round(tooltipPosition.x)}px, ${Math.round(tooltipPosition.y)}px)`,
                            zIndex: 9999,
                            backgroundColor: 'white',
                            padding: '1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            maxWidth: '20rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            fontSize: '0.875rem',
                            lineHeight: '1.25rem',
                            ...tooltipStyle,
                        }}
                    >
                        {content}
                    </div>,
                    document.body,
                )}
        </>
    );
};

export default Tooltip;
