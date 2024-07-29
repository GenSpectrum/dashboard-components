import { type FunctionComponent } from 'preact';

import { Dropdown } from './dropdown';
import { ProportionSelector, type ProportionSelectorProps } from './proportion-selector';

export type ProportionSelectorDropdownProps = ProportionSelectorProps;

export const ProportionSelectorDropdown: FunctionComponent<ProportionSelectorDropdownProps> = ({
    proportionInterval,
    setMinProportion,
    setMaxProportion,
}) => {
    const label = `${(proportionInterval.min * 100).toFixed(1)}% - ${(proportionInterval.max * 100).toFixed(1)}%`;

    return (
        <div className='w-44'>
            <Dropdown buttonTitle={`Proportion ${label}`} placement={'bottom-start'}>
                <ProportionSelector
                    proportionInterval={proportionInterval}
                    setMinProportion={setMinProportion}
                    setMaxProportion={setMaxProportion}
                />
            </Dropdown>
        </div>
    );
};
