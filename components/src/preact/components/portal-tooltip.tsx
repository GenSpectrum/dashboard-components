import { type FunctionComponent } from 'preact';
import { type CSSProperties, createPortal } from 'preact/compat';
import { useState, useRef, useLayoutEffect } from 'preact/hooks';
import { type JSXInternal } from 'preact/src/jsx';

import { type TooltipPosition, TOOLTIP_BASE_STYLES } from './tooltip';

export type PortalTooltipProps = {
    content: string | JSXInternal.Element;
    position?: TooltipPosition;
    tooltipStyle?: CSSProperties;
    portalTarget: HTMLElement | null;
};

/**
 * A portal-based tooltip component that renders content in a specified DOM element.
 *
 * Unlike the regular `Tooltip` component, this uses Preact portals to render the tooltip
 * at a specific location in the DOM with fixed positioning. This is useful when:
 * - The tooltip needs to escape overflow constraints from parent containers
 * - You need precise control over the tooltip's rendering location
 * - Parent containers have `overflow: hidden` or other clipping styles
 *
 * **Important:** The `portalTarget` element should still be within the same shadow DOM as the
 * component to ensure proper styling and encapsulation. Typically, this is a container element
 * at the root of your component. Do not use `document.body`.
 *
 * @example
 * ```tsx
 * const portalTarget = document.getElementById('tooltip-root');
 *
 * <PortalTooltip
 *   content="This is a portal tooltip"
 *   position="top"
 *   portalTarget={portalTarget}
 * >
 *   <button>Hover me</button>
 * </PortalTooltip>
 * ```
 */
const PortalTooltip: FunctionComponent<PortalTooltipProps> = ({
    children,
    content,
    position = 'bottom',
    tooltipStyle,
    portalTarget,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isHovered && triggerRef.current !== null && tooltipRef.current !== null) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const newPosition = calculateTooltipPosition(triggerRect, tooltipRect, position);
            setTooltipPosition(newPosition);
        }
    }, [isHovered, position]);

    const tooltipContent = (
        <div
            ref={tooltipRef}
            className={`fixed ${TOOLTIP_BASE_STYLES} ${isHovered ? 'visible' : 'invisible'}`}
            style={Object.assign({}, tooltipStyle, { top: tooltipPosition.top, left: tooltipPosition.left })}
        >
            {content}
        </div>
    );

    return (
        <>
            <div ref={triggerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                {children}
            </div>
            {portalTarget !== null && createPortal(tooltipContent, portalTarget)}
        </>
    );
};

export default PortalTooltip;

function calculateTooltipPosition(
    triggerRect: DOMRect,
    tooltipRect: DOMRect,
    position: TooltipPosition,
): { top: number; left: number } {
    const gap = 4;
    let top = 0;
    let left = 0;

    switch (position) {
        case 'top':
            top = triggerRect.top - tooltipRect.height - gap;
            left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            break;
        case 'top-start':
            top = triggerRect.top - tooltipRect.height - gap;
            left = triggerRect.left;
            break;
        case 'top-end':
            top = triggerRect.top - tooltipRect.height - gap;
            left = triggerRect.right - tooltipRect.width;
            break;
        case 'bottom':
            top = triggerRect.bottom + gap;
            left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            break;
        case 'bottom-start':
            top = triggerRect.bottom + gap;
            left = triggerRect.left;
            break;
        case 'bottom-end':
            top = triggerRect.bottom + gap;
            left = triggerRect.right - tooltipRect.width;
            break;
        case 'left':
            top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
            left = triggerRect.left - tooltipRect.width - gap;
            break;
        case 'right':
            top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
            left = triggerRect.right + gap;
            break;
    }

    return { top, left };
}
