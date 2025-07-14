import DOMPurify from 'dompurify';
import { useRef } from 'gridjs';
import { Fragment, type FunctionComponent, type RefObject } from 'preact';

import type { SequenceType } from '../../types';
import type { Deletion, Substitution } from '../../utils/mutations';
import { useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
import { InfoHeadline1, InfoHeadline2, InfoParagraph } from './info';
import { ButtonWithModalDialog, useModalRef } from './modal';

export type AnnotatedMutationProps = {
    mutation: Substitution | Deletion;
    sequenceType: SequenceType;
};

export const AnnotatedMutation: FunctionComponent<AnnotatedMutationProps> = (props) => {
    const annotationsProvider = useMutationAnnotationsProvider();
    const modalRef = useModalRef();

    return <AnnotatedMutationWithoutContext {...props} annotationsProvider={annotationsProvider} modalRef={modalRef} />;
};

type GridJsAnnotatedMutationProps = AnnotatedMutationProps & {
    annotationsProvider: ReturnType<typeof useMutationAnnotationsProvider>;
};

/**
 * GridJS internally also uses Preact, but it uses its own Preact instance:
 * - Our Preact contexts are not available in GridJS. We need to inject context content as long as we're in our Preact instance.
 * - We must use the GridJS re-exports of the Preact hooks. I'm not sure why.
 */
export const GridJsAnnotatedMutation: FunctionComponent<GridJsAnnotatedMutationProps> = (props) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    return <AnnotatedMutationWithoutContext {...props} modalRef={modalRef} />;
};

type AnnotatedMutationWithoutContextProps = GridJsAnnotatedMutationProps & {
    modalRef: RefObject<HTMLDialogElement>;
};

const AnnotatedMutationWithoutContext: FunctionComponent<AnnotatedMutationWithoutContextProps> = ({
    mutation,
    sequenceType,
    annotationsProvider,
    modalRef,
}) => {
    const mutationAnnotations = annotationsProvider(mutation, sequenceType);

    if (mutationAnnotations === undefined || mutationAnnotations.length === 0) {
        return mutation.code;
    }

    const modalContent = (
        <div className='block'>
            <InfoHeadline1>Annotations for {mutation.code}</InfoHeadline1>
            {mutationAnnotations.map((annotation) => (
                <Fragment key={annotation.name}>
                    <InfoHeadline2>{annotation.name}</InfoHeadline2>
                    <InfoParagraph>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(annotation.description) }} />
                    </InfoParagraph>
                </Fragment>
            ))}
        </div>
    );

    return (
        <ButtonWithModalDialog
            buttonClassName={'select-text cursor-pointer'}
            modalContent={modalContent}
            modalRef={modalRef}
        >
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
        </ButtonWithModalDialog>
    );
};
