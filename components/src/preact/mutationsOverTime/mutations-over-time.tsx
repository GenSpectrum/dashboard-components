import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { displayMutationsSchema, getFilteredMutationCodes, type MutationFilter } from './getFilteredMutationCodes';
import { MutationsOverTimeGridTooltip } from './mutations-over-time-grid-tooltip';
import {
    getProportion,
    type MutationsOverTimeMetadata,
    type ProportionValue,
    queryMutationsOverTimeMetadata,
    queryMutationsOverTimePage,
} from '../../query/queryMutationsOverTime';
import { lapisFilterSchema, sequenceTypeSchema, temporalGranularitySchema, views } from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type Temporal, toTemporalClass } from '../../utils/temporalClass';
import { useDispatchFinishedLoadingEvent } from '../../utils/useDispatchFinishedLoadingEvent';
import { useLapisUrl } from '../LapisUrlContext';
import { useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
import { type MutationOverTimeDataMap } from './MutationOverTimeData';
import { AnnotatedMutation } from '../components/annotated-mutation';
import { type ColorScale } from '../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../components/color-scale-selector-dropdown';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import {
    customColumnSchema,
    type FeatureRenderer,
    FeaturesOverTimeGridServerPaginated,
} from '../components/features-over-time-grid';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { type DisplayedMutationType, MutationTypeSelector } from '../components/mutation-type-selector';
import { MutationsOverTimeMutationsFilter } from '../components/mutations-over-time-mutations-filter';
import { NoDataDisplay } from '../components/no-data-display';
import type { ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import { type DisplayedSegment, SegmentSelector, useDisplayedSegments } from '../components/segment-selector';
import Tabs from '../components/tabs';
import { pageSizesSchema } from '../shared/tanstackTable/pagination';
import { PageSizeContextProvider, usePageSizeContext } from '../shared/tanstackTable/pagination-context';
import { useQuery } from '../useQuery';
import { handleHideGaps, useMutationsOverTimePageData } from './useMutationsOverTimePageData';

const mutationsOverTimeViewSchema = z.literal(views.grid);
export type MutationsOverTimeView = z.infer<typeof mutationsOverTimeViewSchema>;

const meanProportionIntervalSchema = z.object({
    min: z.number().min(0).max(1),
    max: z.number().min(0).max(1),
});
export type MeanProportionInterval = z.infer<typeof meanProportionIntervalSchema>;

const mutationOverTimeSchema = z.object({
    lapisFilter: lapisFilterSchema,
    sequenceType: sequenceTypeSchema,
    views: z.array(mutationsOverTimeViewSchema),
    granularity: temporalGranularitySchema,
    lapisDateField: z.string().min(1),
    displayMutations: displayMutationsSchema.optional(),
    initialMeanProportionInterval: meanProportionIntervalSchema,
    hideGaps: z.boolean().optional(),
    width: z.string(),
    height: z.string().optional(),
    pageSizes: pageSizesSchema,
    customColumns: z.array(customColumnSchema).optional(),
});
export type MutationsOverTimeProps = z.infer<typeof mutationOverTimeSchema>;

export const MutationsOverTime: FunctionComponent<MutationsOverTimeProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} schema={mutationOverTimeSchema} componentProps={componentProps}>
            <ResizeContainer size={size}>
                <MutationsOverTimeInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const MutationsOverTimeInner: FunctionComponent<MutationsOverTimeProps> = ({ ...componentProps }) => {
    const lapis = useLapisUrl();
    const { lapisFilter, sequenceType, granularity, lapisDateField, displayMutations, pageSizes } = componentProps;

    const [pageIndex, setPageIndex] = useState(0);

    const {
        data: metadata,
        error: metadataError,
        isLoading: metadataLoading,
    } = useQuery(() => {
        setPageIndex(0);
        return queryMutationsOverTimeMetadata(
            lapisFilter,
            sequenceType,
            lapis,
            lapisDateField,
            granularity,
            displayMutations,
        );
    }, [granularity, lapis, lapisDateField, lapisFilter, sequenceType, displayMutations]);

    if (metadataLoading) {
        return <LoadingDisplay />;
    }

    if (metadataError) {
        throw metadataError;
    }

    if (metadata.overallMutationData.length === 0) {
        return <NoDataDisplay />;
    }

    return (
        <PageSizeContextProvider pageSizes={pageSizes}>
            <MutationsOverTimeTabs
                metadata={metadata}
                originalComponentProps={componentProps}
                pageIndex={pageIndex}
                setPageIndex={setPageIndex}
            />
        </PageSizeContextProvider>
    );
};

type MutationOverTimeTabsProps = {
    metadata: MutationsOverTimeMetadata;
    originalComponentProps: MutationsOverTimeProps;
    pageIndex: number;
    setPageIndex: Dispatch<StateUpdater<number>>;
};

const MutationsOverTimeTabs: FunctionComponent<MutationOverTimeTabsProps> = ({
    metadata,
    originalComponentProps,
    pageIndex,
    setPageIndex,
}) => {
    const lapis = useLapisUrl();
    const { lapisFilter, sequenceType, lapisDateField } = originalComponentProps;
    const { overallMutationData, requestedDateRanges } = metadata;
    const { pageSize } = usePageSizeContext();

    const tabsRef = useDispatchFinishedLoadingEvent();
    const tooltipPortalTargetRef = useRef<HTMLDivElement>(null);
    const [tooltipPortalTarget, setTooltipPortalTarget] = useState<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        setTooltipPortalTarget(tooltipPortalTargetRef.current);
    }, []);

    const [mutationFilterValue, setMutationFilterValue] = useState<MutationFilter>({
        textFilter: '',
        annotationNameFilter: new Set(),
    });
    const annotationProvider = useMutationAnnotationsProvider();

    const [proportionInterval, setProportionInterval] = useState(originalComponentProps.initialMeanProportionInterval);
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });

    const [displayedSegments, setDisplayedSegments] = useDisplayedSegments(originalComponentProps.sequenceType);
    const [displayedMutationTypes, setDisplayedMutationTypes] = useState<DisplayedMutationType[]>([
        { label: 'Substitutions', checked: true, type: 'substitution' },
        { label: 'Deletions', checked: true, type: 'deletion' },
    ]);

    const [hideGaps, setHideGaps] = useState<boolean>(originalComponentProps.hideGaps ?? false);
    useEffect(() => setHideGaps(originalComponentProps.hideGaps ?? false), [originalComponentProps.hideGaps]);

    const filteredMutationCodes = useMemo(
        () =>
            getFilteredMutationCodes({
                overallMutationData,
                displayedSegments,
                displayedMutationTypes,
                proportionInterval,
                mutationFilterValue,
                sequenceType: originalComponentProps.sequenceType,
                annotationProvider,
            }),
        [
            overallMutationData,
            displayedSegments,
            displayedMutationTypes,
            proportionInterval,
            originalComponentProps.sequenceType,
            mutationFilterValue,
            annotationProvider,
        ],
    );

    useEffect(() => {
        setPageIndex(0);
    }, [filteredMutationCodes, setPageIndex]);

    const totalFilteredRows = filteredMutationCodes.length;
    const { isLoading: isPageLoading, data: pageData } = useMutationsOverTimePageData(
        filteredMutationCodes,
        pageIndex,
        pageSize,
        lapisFilter,
        lapis,
        lapisDateField,
        sequenceType,
        requestedDateRanges,
        hideGaps,
    );

    const mutationRenderer: FeatureRenderer<Substitution | Deletion> = useMemo(
        () => ({
            asString: (value: Substitution | Deletion) => value.code,
            renderRowLabel: (value: Substitution | Deletion) => (
                <div className={'text-center'}>
                    <AnnotatedMutation mutation={value} sequenceType={originalComponentProps.sequenceType} />
                </div>
            ),
            renderTooltip: (value: Substitution | Deletion, temporal: Temporal, proportionValue: ProportionValue) => (
                <MutationsOverTimeGridTooltip mutation={value} date={temporal} value={proportionValue} />
            ),
        }),
        [originalComponentProps.sequenceType],
    );

    const getTab = (view: MutationsOverTimeView) => {
        switch (view) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for extensibility
            case 'grid':
                return {
                    title: 'Grid',
                    content: (
                        <FeaturesOverTimeGridServerPaginated
                            rowLabelHeader='Mutation'
                            data={pageData}
                            isLoading={isPageLoading}
                            requestedDateRanges={requestedDateRanges}
                            colorScale={colorScale}
                            pageSizes={originalComponentProps.pageSizes}
                            pageIndex={pageIndex}
                            totalRows={totalFilteredRows}
                            onPageChange={setPageIndex}
                            customColumns={originalComponentProps.customColumns}
                            featureRenderer={mutationRenderer}
                            tooltipPortalTarget={tooltipPortalTarget}
                        />
                    ),
                };
        }
    };

    const tabs = originalComponentProps.views.map((view) => getTab(view));

    const toolbar = (activeTab: string) => (
        <Toolbar
            activeTab={activeTab}
            displayedSegments={displayedSegments}
            setDisplayedSegments={setDisplayedSegments}
            displayedMutationTypes={displayedMutationTypes}
            setDisplayedMutationTypes={setDisplayedMutationTypes}
            proportionInterval={proportionInterval}
            setProportionInterval={setProportionInterval}
            hideGaps={hideGaps}
            setHideGaps={setHideGaps}
            colorScale={colorScale}
            setColorScale={setColorScale}
            originalComponentProps={originalComponentProps}
            setFilterValue={setMutationFilterValue}
            mutationFilterValue={mutationFilterValue}
            filteredMutationCodes={filteredMutationCodes}
            metadata={metadata}
        />
    );

    return (
        <div ref={tooltipPortalTargetRef}>
            <Tabs ref={tabsRef} tabs={tabs} toolbar={toolbar} />
        </div>
    );
};

type ToolbarProps = {
    activeTab: string;
    displayedSegments: DisplayedSegment[];
    setDisplayedSegments: (segments: DisplayedSegment[]) => void;
    displayedMutationTypes: DisplayedMutationType[];
    setDisplayedMutationTypes: (types: DisplayedMutationType[]) => void;
    proportionInterval: ProportionInterval;
    setProportionInterval: Dispatch<StateUpdater<ProportionInterval>>;
    hideGaps: boolean;
    setHideGaps: Dispatch<StateUpdater<boolean>>;
    colorScale: ColorScale;
    setColorScale: Dispatch<StateUpdater<ColorScale>>;
    originalComponentProps: MutationsOverTimeProps;
    mutationFilterValue: MutationFilter;
    setFilterValue: Dispatch<StateUpdater<MutationFilter>>;
    filteredMutationCodes: string[];
    metadata: MutationsOverTimeMetadata;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    activeTab,
    displayedSegments,
    setDisplayedSegments,
    displayedMutationTypes,
    setDisplayedMutationTypes,
    proportionInterval,
    setProportionInterval,
    hideGaps,
    setHideGaps,
    colorScale,
    setColorScale,
    originalComponentProps,
    setFilterValue,
    mutationFilterValue,
    filteredMutationCodes,
    metadata,
}) => {
    const lapis = useLapisUrl();
    const { lapisFilter, sequenceType, lapisDateField } = originalComponentProps;

    const getDownloadDataAsync = async (): Promise<Record<string, string | number>[]> => {
        const pageData = await queryMutationsOverTimePage(
            lapisFilter,
            lapis,
            lapisDateField,
            sequenceType,
            metadata.requestedDateRanges,
            filteredMutationCodes,
        );
        return getDownloadData(handleHideGaps(pageData, hideGaps));
    };

    return (
        <>
            <MutationsOverTimeMutationsFilter setFilterValue={setFilterValue} value={mutationFilterValue} />
            <SegmentSelector
                displayedSegments={displayedSegments}
                setDisplayedSegments={setDisplayedSegments}
                sequenceType={originalComponentProps.sequenceType}
            />
            <MutationTypeSelector
                setDisplayedMutationTypes={setDisplayedMutationTypes}
                displayedMutationTypes={displayedMutationTypes}
            />
            <ProportionSelectorDropdown
                proportionInterval={proportionInterval}
                setMinProportion={(min) => setProportionInterval((prev) => ({ ...prev, min }))}
                setMaxProportion={(max) => setProportionInterval((prev) => ({ ...prev, max }))}
                labelPrefix='Mean proportion'
            />
            <button
                className='btn btn-xs w-24'
                onClick={() => setHideGaps((s) => !s)}
                title={
                    hideGaps
                        ? 'Date ranges that do not contain data are excluded from the table'
                        : 'Exclude date ranges without data from the table'
                }
            >
                {hideGaps ? 'Gaps hidden' : 'Hide gaps'}
            </button>
            {activeTab === 'Grid' && (
                <ColorScaleSelectorDropdown colorScale={colorScale} setColorScale={setColorScale} />
            )}
            <CsvDownloadButton
                className='btn btn-xs'
                getData={getDownloadDataAsync}
                filename='mutations_over_time.csv'
            />
            <MutationsOverTimeInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </>
    );
};

type MutationsOverTimeInfoProps = {
    originalComponentProps: MutationsOverTimeProps;
};

const MutationsOverTimeInfo: FunctionComponent<MutationsOverTimeInfoProps> = ({ originalComponentProps }) => {
    const lapis = useLapisUrl();
    return (
        <Info>
            <InfoHeadline1>Mutations over time</InfoHeadline1>
            <InfoParagraph>
                This presents the proportions of {originalComponentProps.sequenceType} mutations per{' '}
                {originalComponentProps.granularity}. In the toolbar, you can configure which mutations are displayed by
                selecting the mutation type (substitution or deletion), choosing specific segments/genes (if the
                organism has multiple segments/genes), and applying a filter based on the proportion of the mutation's
                occurrence over the entire time range.
            </InfoParagraph>
            <InfoParagraph>
                The grid cells have a tooltip that will show more detailed information. It shows the count of samples
                that have the mutation and the count of samples with coverage (i.e. a non-ambiguous read) in this
                timeframe. Ambiguous reads are excluded when calculating the proportion. It also shows the total count
                of samples in this timeframe.
            </InfoParagraph>
            <InfoComponentCode componentName='mutations-over-time' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};

function getDownloadData(filteredData: MutationOverTimeDataMap) {
    const dates = filteredData.getSecondAxisKeys().map((date) => toTemporalClass(date));

    return filteredData.getFirstAxisKeys().map((mutation) => {
        return dates.reduce(
            (accumulated, date) => {
                const value = filteredData.get(mutation, date);
                const proportion = getProportion(value ?? null) ?? '';
                return {
                    ...accumulated,
                    [date.dateString]: proportion,
                };
            },
            { mutation: mutation.code },
        );
    });
}
