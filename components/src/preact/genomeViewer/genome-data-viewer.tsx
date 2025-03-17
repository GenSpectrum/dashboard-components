import type { FunctionComponent } from 'preact';
import z from 'zod';

import { queryGff3Data } from '../../query/queryGff3Data';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import CDSPlot from './CDSPlot';
import { Gff3SourceSchema } from './loadGff3';
import { views } from '../../types';
//import { getMaintainAspectRatio } from '../shared/charts/getMaintainAspectRatio';

export const GenomeViewSchema = z.literal(views.genome);
export type GenomeView = z.infer<typeof GenomeViewSchema>;

const genomeDataViewerPropsSchema = z.object({
    gff3Source: Gff3SourceSchema,
    genomeLength: z.number(),
    width: z.string(),
    height: z.string(),
    views: z.array(GenomeViewSchema),
    zoom: z.number(),
    offsetX: z.number(),
    offsetY: z.number(),
    pageSize: z.union([z.boolean(), z.number()]),
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
    const { gff3Source } = props;

    const { data, error, isLoading: isLoadingData } = useQuery(async () => queryGff3Data(gff3Source), [gff3Source]);

    if (isLoadingData) {
        return <LoadingDisplay />;
    }

    if (error) {
        throw error;
    }

    //const maintainAspectRatio = getMaintainAspectRatio(props.height);

    return <CDSPlot gffData={data} genomeLength={props.genomeLength} />;
};
