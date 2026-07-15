import { type FunctionComponent } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import type { CooccurrencePattern, CooccurrenceOverTimeDataMap } from './CooccurrenceOverTimeData';
import { MutationCooccurrenceGridTooltip } from './mutation-cooccurrence-grid-tooltip';
import { queryMutationCooccurrence } from '../../query/queryMutationCooccurrence';
import { getProportion, type ProportionValue } from '../../query/queryMutationsOverTime';
import { lapisFilterSchema, temporalGranularitySchema, views } from '../../types';
import { Map2dView } from '../../utils/map2d';
import { type Temporal } from '../../utils/temporalClass';
import { useDispatchFinishedLoadingEvent } from '../../utils/useDispatchFinishedLoadingEvent';
import { useLapisUrl } from '../LapisUrlContext';
import { type ColorScale } from '../components/color-scale-selector';
import { ColorScaleSelectorDropdown } from '../components/color-scale-selector-dropdown';
import { CooccurrenceOverTimeGrid } from '../components/cooccurrence-over-time-grid';
import { CsvDownloadButton } from '../components/csv-download-button';
import { ErrorBoundary } from '../components/error-boundary';
import { Fullscreen } from '../components/fullscreen';
import Info, { InfoComponentCode, InfoHeadline1, InfoParagraph } from '../components/info';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import type { ProportionInterval } from '../components/proportion-selector';
import { ProportionSelectorDropdown } from '../components/proportion-selector-dropdown';
import { ResizeContainer } from '../components/resize-container';
import Tabs from '../components/tabs';
import { pageSizesSchema } from '../shared/tanstackTable/pagination';
import { PageSizeContextProvider } from '../shared/tanstackTable/pagination-context';
import { useQuery } from '../useQuery';

const mutationCooccurrenceOverTimeViewSchema = z.literal(views.grid);
export type MutationCooccurrenceOverTimeView = z.infer<typeof mutationCooccurrenceOverTimeViewSchema>;

const mutationCooccurrenceOverTimeSchema = z.object({
    lapisFilter: lapisFilterSchema,
    positions: z.array(z.string()).min(1),
    views: z.array(mutationCooccurrenceOverTimeViewSchema),
    granularity: temporalGranularitySchema,
    lapisDateField: z.string().min(1),
    initialMeanProportionInterval: z.object({
        min: z.number().min(0).max(1),
        max: z.number().min(0).max(1),
    }),
    hideGaps: z.boolean().optional(),
    width: z.string(),
    height: z.string().optional(),
    pageSizes: pageSizesSchema,
});
export type MutationCooccurrenceOverTimeProps = z.infer<typeof mutationCooccurrenceOverTimeSchema>;

export const MutationCooccurrenceOverTime: FunctionComponent<MutationCooccurrenceOverTimeProps> = (componentProps) => {
    const { width, height } = componentProps;
    const size = { height, width };

    return (
        <ErrorBoundary size={size} schema={mutationCooccurrenceOverTimeSchema} componentProps={componentProps}>
            <ResizeContainer size={size}>
                <MutationCooccurrenceOverTimeInner {...componentProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const MutationCooccurrenceOverTimeInner: FunctionComponent<MutationCooccurrenceOverTimeProps> = (componentProps) => {
    const lapis = useLapisUrl();
    const { lapisFilter, positions, granularity, lapisDateField } = componentProps;

    const { data, error, isLoading } = useQuery(
        () => queryMutationCooccurrence(lapisFilter, positions, lapis, lapisDateField, granularity),
        [granularity, lapis, lapisDateField, lapisFilter, positions],
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data.getFirstAxisKeys().length === 0) {
        return <NoDataDisplay />;
    }

    return <MutationCooccurrenceOverTimeTabs data={data} originalComponentProps={componentProps} />;
};

type MutationCooccurrenceOverTimeTabsProps = {
    data: CooccurrenceOverTimeDataMap;
    originalComponentProps: MutationCooccurrenceOverTimeProps;
};

const MutationCooccurrenceOverTimeTabs: FunctionComponent<MutationCooccurrenceOverTimeTabsProps> = ({
    data,
    originalComponentProps,
}) => {
    const tabsRef = useDispatchFinishedLoadingEvent();
    const tooltipPortalTargetRef = useRef<HTMLDivElement>(null);
    const [tooltipPortalTarget, setTooltipPortalTarget] = useState<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        setTooltipPortalTarget(tooltipPortalTargetRef.current);
    }, []);

    const [proportionInterval, setProportionInterval] = useState(originalComponentProps.initialMeanProportionInterval);
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });
    const [hideGaps, setHideGaps] = useState<boolean>(originalComponentProps.hideGaps ?? false);

    const filteredData = useMemo(
        () => getFilteredCooccurrenceData(data, proportionInterval, hideGaps),
        [data, proportionInterval, hideGaps],
    );

    function renderTooltip(pattern: CooccurrencePattern, temporal: Temporal, value: ProportionValue) {
        return <MutationCooccurrenceGridTooltip pattern={pattern} date={temporal} value={value} />;
    }

    const getTab = (view: MutationCooccurrenceOverTimeView) => {
        switch (view) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for extensibility
            case 'grid':
                return {
                    title: 'Grid',
                    content: (
                        <CooccurrenceOverTimeGrid
                            data={filteredData}
                            positions={originalComponentProps.positions}
                            colorScale={colorScale}
                            pageSizes={originalComponentProps.pageSizes}
                            tooltipPortalTarget={tooltipPortalTarget}
                            renderTooltip={renderTooltip}
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
    setProportionInterval: (interval: ProportionInterval) => void;
    hideGaps: boolean;
    setHideGaps: (hideGaps: boolean) => void;
    filteredData: Map2dView<CooccurrencePattern, Temporal, ProportionValue>;
    colorScale: ColorScale;
    setColorScale: (colorScale: ColorScale) => void;
    originalComponentProps: MutationCooccurrenceOverTimeProps;
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
}) => {
    const lapis = useLapisUrl();

    return (
        <>
            <ProportionSelectorDropdown
                proportionInterval={proportionInterval}
                setMinProportion={(min) => setProportionInterval({ ...proportionInterval, min })}
                setMaxProportion={(max) => setProportionInterval({ ...proportionInterval, max })}
                labelPrefix='Mean proportion'
            />
            <button
                className='btn btn-xs w-24'
                onClick={() => setHideGaps(!hideGaps)}
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
                getData={() => getDownloadData(filteredData, originalComponentProps.positions)}
                filename='mutation_cooccurrence.csv'
            />
            <Info>
                <InfoHeadline1>Mutation co-occurrence over time</InfoHeadline1>
                <InfoParagraph>
                    This component displays the frequency of mutation co-occurrence patterns over time. Each row
                    represents a unique combination of alleles at the specified positions. The left columns show the
                    allele at each position, and the right columns show the proportion of sequences with that pattern in
                    each time period.
                </InfoParagraph>
                <InfoParagraph>
                    Use the proportion filter to show only patterns with a mean proportion within a certain range. Use
                    &quot;Hide gaps&quot; to exclude time periods with no data.
                </InfoParagraph>
                <InfoComponentCode
                    componentName='mutation-cooccurrence-over-time'
                    params={originalComponentProps}
                    lapisUrl={lapis}
                />
            </Info>
            <Fullscreen />
        </>
    );
};

function getFilteredCooccurrenceData(
    data: CooccurrenceOverTimeDataMap,
    proportionInterval: { min: number; max: number },
    hideGaps: boolean,
) {
    const view = new Map2dView(data);

    const patterns = view.getFirstAxisKeys();
    const dates = view.getSecondAxisKeys();

    const patternsToRemove = patterns.filter((pattern) => {
        let totalCount = 0;
        let totalTotal = 0;

        for (const date of dates) {
            const value = view.get(pattern, date);
            if (value?.type === 'value') {
                totalCount += value.count;
                totalTotal += value.totalCount;
            } else if (value?.type === 'valueWithCoverage') {
                totalCount += value.count;
                totalTotal += value.coverage;
            }
        }

        const meanProportion = totalTotal > 0 ? totalCount / totalTotal : 0;
        return meanProportion < proportionInterval.min || meanProportion > proportionInterval.max;
    });

    for (const pattern of patternsToRemove) {
        view.deleteRow(pattern);
    }

    if (hideGaps) {
        const datesToRemove = view.getSecondAxisKeys().filter((date) => {
            const vals = view.getColumn(date);
            return !vals.some((v) => {
                if (v?.type === 'value') {
                    return v.totalCount > 0;
                }
                if (v?.type === 'valueWithCoverage') {
                    return v.totalCount > 0;
                }
                return false;
            });
        });
        for (const date of datesToRemove) {
            view.deleteColumn(date);
        }
    }

    return view;
}

function getDownloadData(filteredData: Map2dView<CooccurrencePattern, Temporal, ProportionValue>, positions: string[]) {
    const dates = filteredData.getSecondAxisKeys();

    return filteredData.getFirstAxisKeys().map((pattern) => {
        const row: Record<string, string | number> = {};
        for (const pos of positions) {
            row[pos] = pattern.alleles[pos] ?? '?';
        }
        for (const date of dates) {
            const value = filteredData.get(pattern, date);
            row[date.dateString] = getProportion(value ?? null) ?? '';
        }
        return row;
    });
}
