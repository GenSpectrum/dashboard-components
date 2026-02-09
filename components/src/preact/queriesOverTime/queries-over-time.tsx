import { type FunctionComponent } from 'preact';
import { type Dispatch, type StateUpdater, useMemo, useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import z from 'zod';

import { getFilteredQueryOverTimeData, type QueryFilter } from './getFilteredQueriesOverTimeData';
import { QueriesOverTimeFilter } from './queries-over-time-filter';
import { QueriesOverTimeGridTooltip } from './queries-over-time-grid-tooltip';
import { QueriesOverTimeRowLabelTooltip } from './queries-over-time-row-label-tooltip';
import { type ProportionValue, getProportion } from '../../query/queryMutationsOverTime';
import { queryQueriesOverTimeData } from '../../query/queryQueriesOverTime';
import { lapisFilterSchema, temporalGranularitySchema, views } from '../../types';
import { type Temporal, toTemporalClass } from '../../utils/temporalClass';
import { useDispatchFinishedLoadingEvent } from '../../utils/useDispatchFinishedLoadingEvent';
import { useLapisUrl } from '../LapisUrlContext';
import { type ColorScale } from '../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../components/color-scale-selector-dropdown';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import FeaturesOverTimeGrid, { type FeatureRenderer, customColumnSchema } from '../components/features-over-time-grid';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import PortalTooltip from '../components/portal-tooltip';
import type { ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import Tabs from '../components/tabs';
import { pageSizesSchema } from '../shared/tanstackTable/pagination';
import { PageSizeContextProvider } from '../shared/tanstackTable/pagination-context';
import { useQuery } from '../useQuery';

const queriesOverTimeViewSchema = z.literal(views.grid);
export type QueriesOverTimeView = z.infer<typeof queriesOverTimeViewSchema>;

const meanProportionIntervalSchema = z.object({
    min: z.number().min(0).max(1),
    max: z.number().min(0).max(1),
});
export type MeanProportionInterval = z.infer<typeof meanProportionIntervalSchema>;

const countCoverageQuerySchema = z.object({
    displayLabel: z.string(),
    description: z.string().optional(),
    countQuery: z.string(),
    coverageQuery: z.string(),
});
export type CountCoverageQuery = z.infer<typeof countCoverageQuerySchema>;

const queriesOverTimeSchema = z.object({
    lapisFilter: lapisFilterSchema,
    queries: z
        .array(countCoverageQuerySchema)
        .min(1)
        .refine(
            (queries) => {
                const duplicateDisplayLabels = findDuplicateStrings(queries.map((v) => v.displayLabel));
                return duplicateDisplayLabels.length === 0;
            },
            { message: 'Display labels must be unique' },
        ),
    views: z.array(queriesOverTimeViewSchema),
    granularity: temporalGranularitySchema,
    lapisDateField: z.string().min(1),
    initialMeanProportionInterval: meanProportionIntervalSchema,
    hideGaps: z.boolean().optional(),
    width: z.string(),
    height: z.string().optional(),
    pageSizes: pageSizesSchema,
    customColumns: z.array(customColumnSchema).optional(),
});
export type QueriesOverTimeProps = z.infer<typeof queriesOverTimeSchema>;

export const QueriesOverTime: FunctionComponent<QueriesOverTimeProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} schema={queriesOverTimeSchema} componentProps={componentProps}>
            <ResizeContainer size={size}>
                <QueriesOverTimeInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const QueriesOverTimeInner: FunctionComponent<QueriesOverTimeProps> = ({ ...componentProps }) => {
    const lapis = useLapisUrl();
    const { lapisFilter, queries, granularity, lapisDateField } = componentProps;

    const { data, error, isLoading } = useQuery(
        () => queryQueriesOverTimeData(lapisFilter, queries, lapis, lapisDateField, granularity),
        [granularity, lapis, lapisDateField, lapisFilter, queries],
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    const { queryOverTimeData } = data;

    // Check if there's any data
    if (queryOverTimeData.keysFirstAxis.size === 0) {
        return <NoDataDisplay />;
    }

    return <QueriesOverTimeTabs queryOverTimeData={queryOverTimeData} originalComponentProps={componentProps} />;
};

type QueriesOverTimeTabsProps = {
    queryOverTimeData: Awaited<ReturnType<typeof queryQueriesOverTimeData>>['queryOverTimeData'];
    originalComponentProps: QueriesOverTimeProps;
};

const QueriesOverTimeTabs: FunctionComponent<QueriesOverTimeTabsProps> = ({
    queryOverTimeData,
    originalComponentProps,
}) => {
    const tabsRef = useDispatchFinishedLoadingEvent();
    const tooltipPortalTargetRef = useRef<HTMLDivElement>(null);
    const [tooltipPortalTarget, setTooltipPortalTarget] = useState<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        setTooltipPortalTarget(tooltipPortalTargetRef.current);
    }, []);

    const [queryFilterValue, setQueryFilterValue] = useState<QueryFilter>({
        textFilter: '',
    });

    const [proportionInterval, setProportionInterval] = useState(originalComponentProps.initialMeanProportionInterval);
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });
    const [hideGaps, setHideGaps] = useState<boolean>(originalComponentProps.hideGaps ?? false);

    useEffect(() => setHideGaps(originalComponentProps.hideGaps ?? false), [originalComponentProps.hideGaps]);

    const filteredData = useMemo(() => {
        return getFilteredQueryOverTimeData({
            data: queryOverTimeData,
            proportionInterval,
            hideGaps,
            queryFilterValue,
        });
    }, [queryOverTimeData, proportionInterval, hideGaps, queryFilterValue]);

    const queryLookupMap = useMemo(() => {
        const map = new Map<
            string,
            { displayLabel: string; description?: string; countQuery: string; coverageQuery: string }
        >();
        originalComponentProps.queries.forEach((query) => {
            map.set(query.displayLabel, query);
        });
        return map;
    }, [originalComponentProps.queries]);

    const queryRenderer = useMemo<FeatureRenderer<string>>(
        () => ({
            asString: (value: string) => value,
            renderRowLabel: (value: string) => {
                const queryObject = queryLookupMap.get(value);

                return (
                    <PortalTooltip
                        content={
                            <QueriesOverTimeRowLabelTooltip
                                query={
                                    queryObject ?? {
                                        displayLabel: value,
                                        description: undefined,
                                        countQuery: '',
                                        coverageQuery: '',
                                    }
                                }
                            />
                        }
                        position='right'
                        portalTarget={tooltipPortalTarget}
                    >
                        <div className='text-center'>
                            <span>{value}</span>
                        </div>
                    </PortalTooltip>
                );
            },
            renderTooltip: (value: string, temporal: Temporal, proportionValue: ProportionValue) => (
                <QueriesOverTimeGridTooltip query={value} date={temporal} value={proportionValue} />
            ),
        }),
        [tooltipPortalTarget, queryLookupMap],
    );

    const getTab = (view: QueriesOverTimeView) => {
        switch (view) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for extensibility
            case 'grid':
                return {
                    title: 'Grid',
                    content: (
                        <FeaturesOverTimeGrid
                            rowLabelHeader='Query'
                            data={filteredData}
                            colorScale={colorScale}
                            pageSizes={originalComponentProps.pageSizes}
                            customColumns={originalComponentProps.customColumns}
                            featureRenderer={queryRenderer}
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
            proportionInterval={proportionInterval}
            setProportionInterval={setProportionInterval}
            hideGaps={hideGaps}
            setHideGaps={setHideGaps}
            filteredData={filteredData}
            colorScale={colorScale}
            setColorScale={setColorScale}
            originalComponentProps={originalComponentProps}
            setFilterValue={setQueryFilterValue}
            queryFilterValue={queryFilterValue}
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
    proportionInterval: ProportionInterval;
    setProportionInterval: Dispatch<StateUpdater<ProportionInterval>>;
    hideGaps: boolean;
    setHideGaps: Dispatch<StateUpdater<boolean>>;
    filteredData: ReturnType<typeof getFilteredQueryOverTimeData>;
    colorScale: ColorScale;
    setColorScale: Dispatch<StateUpdater<ColorScale>>;
    originalComponentProps: QueriesOverTimeProps;
    queryFilterValue: QueryFilter;
    setFilterValue: Dispatch<StateUpdater<QueryFilter>>;
};

const Toolbar: FunctionComponent<ToolbarProps> = ({
    activeTab,
    proportionInterval,
    setProportionInterval,
    hideGaps,
    setHideGaps,
    filteredData,
    colorScale,
    setColorScale,
    originalComponentProps,
    setFilterValue,
    queryFilterValue,
}) => {
    return (
        <>
            <QueriesOverTimeFilter setFilterValue={setFilterValue} value={queryFilterValue} />
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
                filename='queries_over_time.csv'
            />
            <QueriesOverTimeInfo originalComponentProps={originalComponentProps} />
            <Fullscreen />
        </>
    );
};

type QueriesOverTimeInfoProps = {
    originalComponentProps: QueriesOverTimeProps;
};

const QueriesOverTimeInfo: FunctionComponent<QueriesOverTimeInfoProps> = ({ originalComponentProps }) => {
    const lapis = useLapisUrl();
    return (
        <Info>
            <InfoHeadline1>Queries over time</InfoHeadline1>
            <InfoParagraph>
                This component displays the proportions of custom queries per {originalComponentProps.granularity}. Each
                query consists of a count query (what to count) and a coverage query (what to use as the denominator).
                In the toolbar, you can filter queries by text and configure which queries are displayed by applying a
                filter based on the mean proportion of the query's occurrence over the entire time range.
            </InfoParagraph>
            <InfoParagraph>
                The grid cells have a tooltip that will show more detailed information. It shows the count of samples
                that match the count query and the count of samples that match the coverage query in this timeframe. It
                also shows the total count of samples in this timeframe.
            </InfoParagraph>
            <InfoComponentCode componentName='queries-over-time' params={originalComponentProps} lapisUrl={lapis} />
        </Info>
    );
};

function getDownloadData(filteredData: ReturnType<typeof getFilteredQueryOverTimeData>) {
    const dates = filteredData.getSecondAxisKeys().map((date) => toTemporalClass(date));

    return filteredData.getFirstAxisKeys().map((query) => {
        return dates.reduce(
            (accumulated, date) => {
                const value = filteredData.get(query, date);
                const proportion = getProportion(value ?? null) ?? '';
                return {
                    ...accumulated,
                    [date.dateString]: proportion,
                };
            },
            { query },
        );
    });
}

function findDuplicateStrings(items: string[]): string[] {
    const counts = new Map<string, number>();

    for (const item of items) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
    }

    return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
}
