import { type FunctionComponent } from 'preact';
import { type CSSProperties } from 'preact/compat';
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

function getPositionCss(position?: TooltipPosition) {
    switch (position) {
        case 'top':
            return 'bottom-full translate-x-[-50%] left-1/2 mb-1';
        case 'top-start':
            return 'bottom-full mr-1 mb-1';
        case 'top-end':
            return 'bottom-full right-0 ml-1 mb-1';
        case 'bottom':
            return 'top-full translate-x-[-50%] left-1/2 mt-1';
        case 'bottom-start':
            return 'mr-1 mt-1';
        case 'bottom-end':
            return 'right-0 ml-1 mt-1';
        case 'left':
            return 'right-full translate-y-[-50%] top-1/2 mr-1';
        case 'right':
            return 'left-full translate-y-[-50%] top-1/2 ml-1';
        case undefined:
            return '';
    }
}

const Tooltip: FunctionComponent<TooltipProps> = ({ children, content, position = 'bottom', tooltipStyle }) => {
    return (
        <div className={`relative group`}>
            <div>{children}</div>
            <div
                className={`absolute z-10 w-max bg-white p-4 border border-gray-200 rounded-md invisible group-hover:visible ${getPositionCss(position)}`}
                style={{ ...tooltipStyle }}
            >
                {content}
            </div>
        </div>
    );
};

export default Tooltip;
