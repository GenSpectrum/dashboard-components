import { type FunctionComponent } from 'preact';

import { Select } from './select';
import type { ConfidenceIntervalMethod } from '../shared/charts/confideceInterval';

type ConfidenceIntervalSelectorProps = {
    confidenceIntervalMethod: ConfidenceIntervalMethod;
    setConfidenceIntervalMethod: (method: ConfidenceIntervalMethod) => void;
    confidenceIntervalMethods: ConfidenceIntervalMethod[];
};

export const ConfidenceIntervalSelector: FunctionComponent<ConfidenceIntervalSelectorProps> = ({
    confidenceIntervalMethod,
    setConfidenceIntervalMethod,
    confidenceIntervalMethods,
}) => {
    if (confidenceIntervalMethods.length === 0) {
        return null;
    }

    const items = [
        { label: 'Confidence interval method', value: 'none', disabled: true },
        ...confidenceIntervalMethods.map((method) => {
            switch (method) {
                case 'wilson':
                    return { label: 'Wilson, 95% CI', value: 'wilson' };
                case 'none':
                    return { label: 'None', value: 'none' };
            }
        }),
    ];

    return (
        <Select
            items={items}
            selected={confidenceIntervalMethod === undefined ? 'none' : confidenceIntervalMethod}
            onChange={(event: Event) => {
                const select = event.target as HTMLSelectElement;
                const value = select.value as ConfidenceIntervalMethod;
                setConfidenceIntervalMethod(value);
            }}
            selectStyle={'select-xs'}
        />
    );
};
