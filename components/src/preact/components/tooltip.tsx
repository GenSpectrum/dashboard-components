import { flip, offset, shift } from '@floating-ui/dom';
import { type FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { type JSXInternal } from 'preact/src/jsx';

import { dropdownClass } from './dropdown';
import { useFloatingUi } from '../shared/floating-ui/hooks';

export type TooltipProps = {
    content: string | JSXInternal.Element;
};

const Tooltip: FunctionComponent<TooltipProps> = ({ children, content }) => {
    const referenceRef = useRef<HTMLDivElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);

    useFloatingUi(referenceRef, floatingRef, [offset(5), shift(), flip()]);

    return (
        <div className='relative'>
            <div className='peer' ref={referenceRef}>
                {children}
            </div>
            <div ref={floatingRef} className={`${dropdownClass} hidden peer-hover:block`}>
                {content}
            </div>
        </div>
    );
};

export default Tooltip;
