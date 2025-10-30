import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useMemo, useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import z from 'zod';

// @ts-expect-error -- uses subpath imports and vite worker import
import MutationOverTimeWorker from '#mutationOverTime?worker&inline';
import { BaseMutationOverTimeDataMap, type MutationOverTimeDataMap } from './MutationOverTimeData';
import {
    displayMutationsSchema,
    getFilteredMutationOverTimeData,
    type MutationFilter,
} from './getFilteredMutationsOverTimeData';
import { type MutationOverTimeWorkerResponse } from './mutationOverTimeWorker';
import MutationsOverTimeGrid from './mutations-over-time-grid';
import { type MutationOverTimeQuery } from '../../query/queryMutationsOverTime';
import {
    lapisFilterSchema,
    sequenceTypeSchema,
    type SubstitutionOrDeletionEntry,
    temporalGranularitySchema,
    views,
} from '../../types';
import { type Deletion, type Substitution } from '../../utils/mutations';
import { toTemporalClass } from '../../utils/temporalClass';
import { useDispatchFinishedLoadingEvent } from '../../utils/useDispatchFinishedLoadingEvent';
import { useLapisUrl } from '../LapisUrlContext';
import { useMutationAnnotationsProvider } from '../MutationAnnotationsContext';
import { type ColorScale } from '../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../components/color-scale-selector-dropdown';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
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
import { useWebWorker } from '../webWorkers/useWebWorker';

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
    useNewEndpoint: z.boolean().optional(),
    displayMutations: displayMutationsSchema.optional(),
    initialMeanProportionInterval: meanProportionIntervalSchema,
    hideGaps: z.boolean().optional(),
    width: z.string(),
    height: z.string().optional(),
    pageSizes: pageSizesSchema,
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

export const MutationsOverTimeInner: FunctionComponent<MutationsOverTimeProps> = ({
    useNewEndpoint = false,
    ...componentProps
}) => {
    const lapis = useLapisUrl();
    const { lapisFilter, sequenceType, granularity, lapisDateField, displayMutations } = componentProps;

    const messageToWorker: MutationOverTimeQuery = useMemo(() => {
        return {
            lapisFilter,
            sequenceType,
            granularity,
            lapisDateField,
            lapis,
            displayMutations,
            useNewEndpoint,
        };
    }, [granularity, lapis, lapisDateField, lapisFilter, sequenceType, displayMutations, useNewEndpoint]);

    const { data, error, isLoading } = useWebWorker<MutationOverTimeWorkerResponse>(
        messageToWorker,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        MutationOverTimeWorker,
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== undefined) {
        throw error;
    }

    if (data === undefined || data.overallMutationData.length === 0) {
        return <NoDataDisplay />;
    }

    const { overallMutationData, mutationOverTimeSerialized } = data;
    const mutationOverTimeData = new BaseMutationOverTimeDataMap(mutationOverTimeSerialized);
    return (
        <MutationsOverTimeTabs
            overallMutationData={overallMutationData}
            mutationOverTimeData={mutationOverTimeData}
            originalComponentProps={componentProps}
        />
    );
};

type MutationOverTimeTabsProps = {
    mutationOverTimeData: BaseMutationOverTimeDataMap;
    originalComponentProps: MutationsOverTimeProps;
    overallMutationData: SubstitutionOrDeletionEntry<Substitution, Deletion>[];
};

const MutationsOverTimeTabs: FunctionComponent<MutationOverTimeTabsProps> = ({
    mutationOverTimeData,
    originalComponentProps,
    overallMutationData,
}) => {
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

    const filteredData = useMemo(() => {
        return getFilteredMutationOverTimeData({
            data: mutationOverTimeData,
            overallMutationData,
            displayedSegments,
            displayedMutationTypes,
            proportionInterval,
            hideGaps,
            mutationFilterValue,
            sequenceType: originalComponentProps.sequenceType,
            annotationProvider,
        });
    }, [
        mutationOverTimeData,
        overallMutationData,
        displayedSegments,
        displayedMutationTypes,
        proportionInterval,
        hideGaps,
        originalComponentProps.sequenceType,
        mutationFilterValue,
        annotationProvider,
    ]);

    const getTab = (view: MutationsOverTimeView) => {
        switch (view) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for extensibility
            case 'grid':
                return {
                    title: 'Grid',
                    content: (
                        <MutationsOverTimeGrid
                            data={filteredData}
                            colorScale={colorScale}
                            sequenceType={originalComponentProps.sequenceType}
                            pageSizes={originalComponentProps.pageSizes}
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
            filteredData={filteredData}
            colorScale={colorScale}
            setColorScale={setColorScale}
            originalComponentProps={originalComponentProps}
            setFilterValue={setMutationFilterValue}
            mutationFilterValue={mutationFilterValue}
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
    filteredData: MutationOverTimeDataMap;
    colorScale: ColorScale;
    setColorScale: Dispatch<StateUpdater<ColorScale>>;
    originalComponentProps: MutationsOverTimeProps;
    mutationFilterValue: MutationFilter;
    setFilterValue: Dispatch<StateUpdater<MutationFilter>>;
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
    filteredData,
    colorScale,
    setColorScale,
    originalComponentProps,
    setFilterValue,
    mutationFilterValue,
}) => {
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
                getData={() => getDownloadData(filteredData)}
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
                const proportion = value?.type === 'value' || value?.type === 'wastewaterValue' ? value.proportion : '';
                return {
                    ...accumulated,
                    [date.dateString]: proportion,
                };
            },
            { mutation: mutation.code },
        );
    });
}
