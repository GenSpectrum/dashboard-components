import { type NamedLapisFilter } from '../../types';
import { ErrorBoundary } from '../components/error-boundary';
import Headline from '../components/headline';
import { ResizeContainer } from '../components/resize-container';

export interface NumberSequencesOverTimeProps extends NumberSequencesOverTimeInnerProps {
    width: string;
    height: string;
    headline?: string;
}

interface NumberSequencesOverTimeInnerProps {
    lapisFilter: NamedLapisFilter | NamedLapisFilter[];
    views: ('bar' | 'line' | 'table')[];
}

export function NumberSequencesOverTime({ width, height, headline, ...innerProps }: NumberSequencesOverTimeProps) {
    const size = { height, width };

    return (
        <ErrorBoundary size={size} headline={headline}>
            <ResizeContainer size={size}>
                <Headline heading={headline}>
                    <NumberSequencesOverTimeInner {...innerProps} />
                </Headline>
            </ResizeContainer>
        </ErrorBoundary>
    );
}

const NumberSequencesOverTimeInner = ({}: NumberSequencesOverTimeInnerProps) => {
    return <div>Inner</div>;
};
