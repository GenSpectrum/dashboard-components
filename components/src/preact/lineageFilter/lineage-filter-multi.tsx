import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import z from 'zod';

import { useLapisUrl } from '../LapisUrlContext';
import { fetchLineageAutocompleteList, type LineageItem } from './fetchLineageAutocompleteList';
import { lapisFilterSchema } from '../../types';
import { DownshiftMultiCombobox } from '../components/downshift-combobox';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import { gsEventNames } from '../../utils/gsEventNames';

type LapisLineageMultiFilter = Record<string, string[] | undefined>;

export class LineageMultiFilterChangedEvent extends CustomEvent<LapisLineageMultiFilter> {
    constructor(detail: LapisLineageMultiFilter) {
        super(gsEventNames.lineageFilterChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}

const multiLineageSelectorPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    value: z.union([z.string(), z.array(z.string())]).default(''),
    hideCounts: z.boolean().optional(),
});
const multiLineageFilterInnerPropsSchema = multiLineageSelectorPropsSchema.extend({
    lapisFilter: lapisFilterSchema,
});
const multiLineageFilterPropsSchema = multiLineageFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type MultiLineageFilterInnerProps = z.infer<typeof multiLineageFilterInnerPropsSchema>;
export type MultiLineageFilterProps = z.infer<typeof multiLineageFilterPropsSchema>;
type MultiLineageSelectorProps = z.infer<typeof multiLineageSelectorPropsSchema>;

export const MultiLineageFilter: FunctionComponent<MultiLineageFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={multiLineageFilterPropsSchema}>
            <ResizeContainer size={size}>
                <MultiLineageFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const MultiLineageFilterInner: FunctionComponent<MultiLineageFilterInnerProps> = ({
    lapisField,
    placeholderText,
    value,
    lapisFilter,
    hideCounts,
}) => {
    const lapisUrl = useLapisUrl();

    const { data, error, isLoading } = useQuery(
        () => fetchLineageAutocompleteList({ lapisUrl, lapisField, lapisFilter }),
        [lapisField, lapisUrl, lapisFilter],
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    return (
        <MultiLineageSelector
            lapisField={lapisField}
            value={value}
            placeholderText={placeholderText}
            data={data}
            hideCounts={hideCounts}
        />
    );
};

const MultiLineageSelector = ({
    lapisField,
    value,
    placeholderText,
    data,
    hideCounts = false,
}: MultiLineageSelectorProps & {
    data: LineageItem[];
}) => {
    // Parse value as either comma-separated string or array
    const valueArray = useMemo(() => {
        if (Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'string' && value.trim() !== '') {
            return value.split(',').map((v) => v.trim());
        }
        return [];
    }, [value]);

    const selectedItems = useMemo(() => {
        return valueArray
            .map((lineageValue) => data.find((item) => item.lineage === lineageValue))
            .filter((item): item is LineageItem => item !== undefined);
    }, [data, valueArray]);

    return (
        <DownshiftMultiCombobox
            allItems={data}
            value={selectedItems}
            filterItemsByInputValue={filterByInputValue}
            createEvent={(items) => {
                const lineages = items.length > 0 ? items.map((item) => item.lineage) : undefined;
                return new LineageMultiFilterChangedEvent({ [lapisField]: lineages });
            }}
            itemToString={(item) => item?.lineage ?? ''}
            placeholderText={placeholderText ?? 'Select lineages'}
            formatItemInList={(item: LineageItem) => (
                <p>
                    <span>{item.lineage}</span>
                    {!hideCounts && <span className='ml-2 text-gray-500'>({item.count.toLocaleString('en-US')})</span>}
                </p>
            )}
            formatSelectedItem={(item: LineageItem) => <span>{item.lineage}</span>}
        />
    );
};

function filterByInputValue(item: LineageItem, inputValue: string | null) {
    if (inputValue === null || inputValue === '') {
        return true;
    }
    return item.lineage.toLowerCase().includes(inputValue.toLowerCase() || '');
}
