import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useMemo, useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import z from 'zod';

import { displayMutationsSchema, getFilteredMutationOverTimeData, type MutationFilter } from './getFilteredMutationsOverTimeData';
import { MutationsOverTimeGridTooltip } from './mutations-over-time-grid-tooltip';
import {
    type MutationsOverTimeMetadata,
    type ProportionValue,
    getProportion,
    queryMutationsOverTimeData,
    queryMutationsOverTimeMetadata,
    queryMutationsOverTimePage,
} from '../../query/queryMutationsOverTime';
import { lapisFilterSchema, sequenceTypeSchema, temporalGranularitySchema, views } from '../../types';
import { Map2dView } from '../../utils/map2d';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { type Temporal, toTemporalClass } from '../../utils/temporalClass';
import { useDispatchFinishedLoadingEvent } from '../../utils/useDispatchFinishedLoadingEvent';
import { useLapisUrl } from '../LapisUrlContext';
import { useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
import { AnnotatedMutation } from '../components/annotated-mutation';
import { type ColorScale } from '../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../components/color-scale-selector-dropdown';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import {
    FeaturesOverTimeGridServerPaginated,
    type FeatureRenderer,
    customColumnSchema,
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
import { PageSizeContextProvider } from '../shared/tanstackTable/pagination-context';
import { useQuery } from '../useQuery';

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

    const initialPageSize = typeof pageSizes === 'number' ? pageSizes : (pageSizes.at(0) ?? 10);

    // Lifted page state — needed so that page changes trigger Phase 2 re-fetches
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Phase 1: fetch date buckets + full sorted mutation list (cheap, independent of page)
    const {
        data: metadata,
        error: metadataError,
        isLoading: metadataLoading,
    } = useQuery(
        () =>
            queryMutationsOverTimeMetadata(
                lapisFilter,
                sequenceType,
                lapis,
                lapisDateField,
                granularity,
                displayMutations,
            ),
        [granularity, lapis, lapisDateField, lapisFilter, sequenceType, displayMutations],
    );

    // Reset to page 0 when the metadata (i.e. filter) changes
    useEffect(() => {
        setPageIndex(0);
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
        <MutationsOverTimeTabs
            metadata={metadata}
            originalComponentProps={componentProps}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageSize={pageSize}
            setPageSize={setPageSize}
        />
    );
};

type MutationOverTimeTabsProps = {
    metadata: MutationsOverTimeMetadata;
    originalComponentProps: MutationsOverTimeProps;
    pageIndex: number;
    setPageIndex: Dispatch<StateUpdater<number>>;
    pageSize: number;
    setPageSize: Dispatch<StateUpdater<number>>;
};

const MutationsOverTimeTabs: FunctionComponent<MutationOverTimeTabsProps> = ({
    metadata,
    originalComponentProps,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
}) => {
    const lapis = useLapisUrl();
    const { lapisFilter, sequenceType, lapisDateField } = originalComponentProps;
    const { overallMutationData, requestedDateRanges } = metadata;

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

    // Step 1: Filter the full mutation list from Phase 1 by proportion, type, segment and text.
    // hideGaps cannot be applied here — it requires time-series data from Phase 2.
    const filteredMutationCodes = useMemo(
        () =>
            getFilteredMutationOverTimeData({
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

    // The sorted, filtered list of all mutation codes (used for paging and total count)
    const totalFilteredRows = filteredMutationCodes.length;

    // Slice to the current page
    const pageMutationCodes = filteredMutationCodes.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    // Step 2: fetch time-series data for just the current page's mutations
    const {
        data: pageData,
        error: pageError,
        isLoading: pageLoading,
    } = useQuery(
        () =>
            queryMutationsOverTimePage(
                lapisFilter,
                lapis,
                lapisDateField,
                sequenceType,
                requestedDateRanges,
                pageMutationCodes,
            ),
        [lapisFilter, lapis, lapisDateField, sequenceType, requestedDateRanges, pageMutationCodes],
    );

    if (pageError) {
        throw pageError;
    }

    const filteredData = useMemo(() => {
        if (!pageData || !hideGaps) {
            return pageData ?? null;
        }
        const view = new Map2dView(pageData);
        view.getSecondAxisKeys()
            .filter((dateRange) => {
                const vals = view.getColumn(dateRange);
                return !vals.some((v) => (v?.type === 'value' || v?.type === 'valueWithCoverage') && v.totalCount > 0);
            })
            .forEach((dateRange) => view.deleteColumn(dateRange));
        return view;
    }, [pageData, hideGaps]);

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
                            data={filteredData ?? pageData}
                            isLoading={pageLoading}
                            colorScale={colorScale}
                            pageSizes={originalComponentProps.pageSizes}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            totalRows={totalFilteredRows}
                            onPageChange={setPageIndex}
                            onPageSizeChange={setPageSize}
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
        />
    );

    return (
        <div ref={tooltipPortalTargetRef}>
            <PageSizeContextProvider pageSizes={originalComponentProps.pageSizes}>
                <Tabs ref={tabsRef} tabs={tabs} toolbar={toolbar} />
            </PageSizeContextProvider>
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
    /** Filtered mutation codes (all pages) — used for download-all */
    filteredMutationCodes: string[];
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
}) => {
    const lapis = useLapisUrl();
    const { lapisFilter, sequenceType, lapisDateField } = originalComponentProps;

    // Download-all: fetch the full time-series for ALL filtered mutations (not just current page)
    const getDownloadDataAsync = async (): Promise<Record<string, string | number>[]> => {
        const allData = await queryMutationsOverTimeData(
            lapisFilter,
            sequenceType,
            lapis,
            lapisDateField,
            originalComponentProps.granularity,
        );
        // Filter down to only the mutations that pass the current client-side filters
        const filteredCodeSet = new Set(filteredMutationCodes);
        const dates = allData.mutationOverTimeData.getSecondAxisKeys().map((date) => toTemporalClass(date));
        return allData.mutationOverTimeData
            .getFirstAxisKeys()
            .filter((m) => filteredCodeSet.has(m.code))
            .map((mutation) => {
                return dates.reduce<Record<string, string | number>>(
                    (accumulated, date) => {
                        const value = allData.mutationOverTimeData.get(mutation, date);
                        const proportion = getProportion(value ?? null) ?? '';
                        return {
                            ...accumulated,
                            [date.dateString]: proportion,
                        };
                    },
                    { mutation: mutation.code },
                );
            });
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
