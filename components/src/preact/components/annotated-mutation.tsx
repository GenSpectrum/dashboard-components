import { Fragment, type FunctionComponent } from 'preact';

import type { SequenceType } from '../../types';
import type { Deletion, Substitution } from '../../utils/mutations';
import { useMutationAnnotation } from '../MutationAnnotationsContext';
import { InfoHeadline1, InfoHeadline2, InfoParagraph } from './info';
import { ModalButton } from './modal';

export type AnnotatedMutationProps = {
    mutation: Substitution | Deletion;
    sequenceType: SequenceType;
};

export const AnnotatedMutation: FunctionComponent<AnnotatedMutationProps> = ({ mutation, sequenceType }) => {
    const mutationAnnotations = useMutationAnnotation(mutation.code, sequenceType);

    if (mutationAnnotations === undefined || mutationAnnotations.length === 0) {
        return mutation.code;
    }

    const modalContent = (
        <div className='block'>
            <InfoHeadline1>Annotations for {mutation.code}</InfoHeadline1>
            {mutationAnnotations.map((annotation) => (
                <Fragment key={annotation.name}>
                    <InfoHeadline2>{annotation.name}</InfoHeadline2>
                    <InfoParagraph>{annotation.description}</InfoParagraph>
                </Fragment>
            ))}
        </div>
    );

    return (
        <ModalButton modalContent={modalContent}>
            {mutation.code}
            <sup>
                {mutationAnnotations
                    .map((annotation) => annotation.symbol)
                    .map((symbol, index) => (
                        <Fragment key={symbol}>
                            <span className='text-red-600'>{symbol}</span>
                            {index !== mutationAnnotations.length - 1 && ','}
                        </Fragment>
                    ))}
            </sup>
        </ModalButton>
    );
};
