import type { FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import CDSPlot from './CDSPlot';
import { loadGff3 } from './loadGff3';

const genomeDataViewerPropsSchema = z.object({
    gff3Source: z.string().min(1, 'gff3Source cannot be empty'),
    genomeLength: z.number().gt(0, 'genomeLength must be greater than 0').optional(),
    width: z.string(),
});

interface ExtendedGenomeDataViewerProps extends GenomeDataViewerProps {
    trueWidth: number;
}

export type GenomeDataViewerProps = z.infer<typeof genomeDataViewerPropsSchema>;

export const GenomeDataViewer: FunctionComponent<GenomeDataViewerProps> = (componentProps) => {
    const { width } = componentProps;
    const size = { height: '100%', width };
    const containerRef = useRef<HTMLDivElement>(null);
    const [trueWidth, setTrueWidth] = useState(0);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setTrueWidth(containerRef.current.getBoundingClientRect().width);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <ErrorBoundary size={size} componentProps={componentProps} schema={genomeDataViewerPropsSchema}>
            <ResizeContainer size={size} ref={containerRef}>
                <GenomeDataViewerInner {...componentProps} trueWidth={trueWidth} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const GenomeDataViewerInner: FunctionComponent<ExtendedGenomeDataViewerProps> = (props) => {
    const { gff3Source, genomeLength, trueWidth } = props;

    const {
        data,
        error,
        isLoading: isLoadingData,
    } = useQuery(() => loadGff3(gff3Source, genomeLength), [gff3Source, genomeLength]);

    if (isLoadingData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    return <CDSPlot gffData={data.features} genomeLength={data.length} width={trueWidth} />;
};
