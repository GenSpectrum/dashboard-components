import type { FunctionComponent } from 'preact';
import z from 'zod';

import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import CDSPlot from './CDSPlot';
import { loadGff3 } from './loadGff3';

const genomeDataViewerPropsSchema = z.object({
    gff3Source: z.string(),
    genomeLength: z.number(),
    width: z.string(),
    height: z.string(),
});

export type GenomeDataViewerProps = z.infer<typeof genomeDataViewerPropsSchema>;

export const GenomeDataViewer: FunctionComponent<GenomeDataViewerProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} componentProps={componentProps} schema={genomeDataViewerPropsSchema}>
            <ResizeContainer size={size}>
                <GenomeDataViewerInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const GenomeDataViewerInner: FunctionComponent<GenomeDataViewerProps> = (props) => {
    const { gff3Source, width, height } = props;
    const size = { height, width };

    const { data, error, isLoading: isLoadingData } = useQuery(() => loadGff3(gff3Source), [gff3Source]);

    if (isLoadingData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    return <CDSPlot gffData={data} genomeLength={props.genomeLength} size={size} />;
};
