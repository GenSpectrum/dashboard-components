import { type FunctionComponent } from 'preact';

import { Dropdown } from './dropdown';
import { ProportionSelector, type ProportionSelectorProps } from './proportion-selector';

export type ProportionSelectorDropdownProps = ProportionSelectorProps & { labelPrefix?: string };

export const ProportionSelectorDropdown: FunctionComponent<ProportionSelectorDropdownProps> = ({
    proportionInterval,
    setMinProportion,
    setMaxProportion,
    labelPrefix = 'Proportion',
}) => {
    const percentLabel = `${(proportionInterval.min * 100).toFixed(1)}% - ${(proportionInterval.max * 100).toFixed(1)}%`;

    const width = 'w-[calc(1.5 * var(--tw-space-x-reverse) + 1.5 * var(--tw-space-x))]';

    return (
        <div className={width}>
            <Dropdown buttonTitle={`${labelPrefix} ${percentLabel}`} placement={'bottom-start'}>
                <ProportionSelector
                    proportionInterval={proportionInterval}
                    setMinProportion={setMinProportion}
                    setMaxProportion={setMaxProportion}
                />
            </Dropdown>
        </div>
    );
};
