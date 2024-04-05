import { type FunctionComponent } from 'preact';

import { ProportionSelector, type ProportionSelectorProps } from './proportion-selector';

export interface ProportionSelectorDropdownProps extends ProportionSelectorProps {
    openDirection?: 'left' | 'right';
}

export const ProportionSelectorDropdown: FunctionComponent<ProportionSelectorDropdownProps> = ({
    proportionInterval,
    setMinProportion,
    setMaxProportion,
    openDirection = 'right',
}) => {
    const label = `${(proportionInterval.min * 100).toFixed(1)}% - ${(proportionInterval.max * 100).toFixed(1)}%`;

    return (
        <div class={`dropdown ${openDirection === 'left' ? 'dropdown-end' : ''}`}>
            <div tabIndex={0} role='button' class='btn btn-xs whitespace-nowrap'>
                Proportion {label}
            </div>
            <ul tabIndex={0} class='p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-72'>
                <div class='mb-2 ml-2'>
                    <ProportionSelector
                        proportionInterval={proportionInterval}
                        setMinProportion={setMinProportion}
                        setMaxProportion={setMaxProportion}
                    />
                </div>
            </ul>
        </div>
    );
};
