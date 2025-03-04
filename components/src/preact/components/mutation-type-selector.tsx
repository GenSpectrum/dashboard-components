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
    return (
        <div className='w-[6rem] inline-flex'>
            <CheckboxSelector
                items={displayedMutationTypes}
                label={getMutationTypesSelectorLabel(displayedMutationTypes)}
                setItems={(items) => setDisplayedMutationTypes(items)}
            />
        </div>
    );
};

const getMutationTypesSelectorLabel = (displayedMutationTypes: DisplayedMutationType[]) => {
    const checkedLabels = displayedMutationTypes.filter((displayedMutationType) => displayedMutationType.checked);

    if (checkedLabels.length === 0) {
        return `No types`;
    }
    if (displayedMutationTypes.length === checkedLabels.length) {
        return displayedMutationTypes
            .map((type) => {
                switch (type.type) {
                    case 'substitution':
                        return 'Subst.';
                    case 'deletion':
                        return 'Del.';
                }
            })
            .join(', ');
    }

    return checkedLabels
        .map((type) => {
            return type.label;
        })
        .join(', ');
};
