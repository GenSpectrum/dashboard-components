import { flip, offset, shift } from '@floating-ui/dom';
import { type Placement } from '@floating-ui/utils';
import { type FunctionComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { useCloseOnClickOutside, useCloseOnEsc, useFloatingUi } from '../shared/floating-ui/hooks';

interface DropdownProps {
    buttonTitle: string;
    placement?: Placement;
}

export const dropdownClass =
    'z-10 absolute w-max top-0 left-0 bg-white p-4 border border-gray-200 shadow-lg rounded-md';

export const Dropdown: FunctionComponent<DropdownProps> = ({ children, buttonTitle, placement }) => {
    const [showContent, setShowContent] = useState(false);
    const referenceRef = useRef<HTMLButtonElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);

    useFloatingUi(referenceRef, floatingRef, [offset(4), shift(), flip()], placement);

    useCloseOnClickOutside(floatingRef, referenceRef, setShowContent);
    useCloseOnEsc(setShowContent);

    const toggle = () => {
        setShowContent(!showContent);
    };

    return (
        <div>
            <button type='button' className='btn btn-xs whitespace-nowrap' onClick={toggle} ref={referenceRef}>
                {buttonTitle}
            </button>
            <div ref={floatingRef} className={`${dropdownClass} ${showContent ? '' : 'hidden'}`}>
                {children}
            </div>
        </div>
    );
};
