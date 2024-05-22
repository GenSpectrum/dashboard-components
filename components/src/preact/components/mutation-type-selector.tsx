import { type FunctionComponent } from 'preact/compat';

import { type CheckboxItem, CheckboxSelector } from './checkbox-selector';
import type { SubstitutionOrDeletion } from '../../types';

export type DisplayedMutationType = CheckboxItem & {
    type: SubstitutionOrDeletion;
};

export type MutationTypeSelectorProps = {
    displayedMutationTypes: DisplayedMutationType[];
    setDisplayedMutationTypes: (mutationTypes: DisplayedMutationType[]) => void;
};

export const MutationTypeSelector: FunctionComponent<MutationTypeSelectorProps> = ({
    displayedMutationTypes,
    setDisplayedMutationTypes,
}) => {
    const checkedLabels = displayedMutationTypes.filter((type) => type.checked).map((type) => type.label);
    const mutationTypesSelectorLabel = `Types: ${checkedLabels.length > 0 ? checkedLabels.join(', ') : 'None'}`;

    return (
        <CheckboxSelector
            items={displayedMutationTypes}
            label={mutationTypesSelectorLabel}
            setItems={(items) => setDisplayedMutationTypes(items)}
        />
    );
};
