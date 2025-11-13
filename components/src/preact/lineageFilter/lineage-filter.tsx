import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import z from 'zod';

import { useLapisUrl } from '../LapisUrlContext';
import { LineageFilterChangedEvent, LineageMultiFilterChangedEvent } from './LineageFilterChangedEvent';
import { type LineageItem, fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
import { lapisFilterSchema } from '../../types';
import { DownshiftCombobox, DownshiftMultiCombobox } from '../components/downshift-combobox';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const lineageSelectorPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    value: z.union([z.string(), z.array(z.string())]),
    hideCounts: z.boolean().optional(),
    multiSelect: z.boolean().optional(),
});

const lineageFilterInnerPropsSchema = lineageSelectorPropsSchema.extend({
    lapisFilter: lapisFilterSchema,
});

const lineageFilterPropsSchema = lineageFilterInnerPropsSchema
    .extend({
        width: z.string(),
    })
    .refine(
        (data) => {
            if (data.multiSelect && typeof data.value === 'string') {
                return false;
            }
            if (!data.multiSelect && Array.isArray(data.value)) {
                return false;
            }
            return true;
        },
        (data) => ({
            message: data.multiSelect
                ? 'When multiSelect is true, value must be an array of strings'
                : 'When multiSelect is false or undefined, value must be a string',
            path: ['value'],
        }),
    );

export type LineageFilterInnerProps = z.infer<typeof lineageFilterInnerPropsSchema>;
export type LineageFilterProps = z.infer<typeof lineageFilterPropsSchema>;
type LineageSelectorProps = z.infer<typeof lineageSelectorPropsSchema>;

export const LineageFilter: FunctionComponent<LineageFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, minHeight: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={lineageFilterPropsSchema}>
            <ResizeContainer size={size}>
                <LineageFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const LineageFilterInner: FunctionComponent<LineageFilterInnerProps> = ({
    lapisField,
    placeholderText,
    value,
    lapisFilter,
    hideCounts,
    multiSelect = false,
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
        <LineageSelector
            lapisField={lapisField}
            value={value}
            placeholderText={placeholderText}
            data={data}
            hideCounts={hideCounts}
            multiSelect={multiSelect}
        />
    );
};

const LineageSelector = ({
    lapisField,
    value,
    placeholderText,
    data,
    hideCounts = false,
    multiSelect = false,
}: LineageSelectorProps & {
    data: LineageItem[];
}) => {
    const formatItemInList = (item: LineageItem) => (
        <p>
            <span>{item.lineage}</span>
            {!hideCounts && <span className='ml-2 text-gray-500'>({item.count.toLocaleString('en-US')})</span>}
        </p>
    );

    const selectedItems = useMemo(() => {
        const valueArray = Array.isArray(value) ? value : [];
        return valueArray
            .map((lineageValue) => data.find((item) => item.lineage === lineageValue))
            .filter((item): item is LineageItem => item !== undefined);
    }, [data, value]);

    const selectedItem = useMemo(() => {
        const valueString = typeof value === 'string' ? value : '';
        return data.find((item) => item.lineage === valueString) ?? null;
    }, [data, value]);

    if (multiSelect) {
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
                formatItemInList={formatItemInList}
                formatSelectedItem={(item: LineageItem) => <span>{item.lineage}</span>}
            />
        );
    }
    return (
        <DownshiftCombobox
            allItems={data}
            value={selectedItem}
            filterItemsByInputValue={filterByInputValue}
            createEvent={(item) => new LineageFilterChangedEvent({ [lapisField]: item?.lineage ?? undefined })}
            itemToString={(item) => item?.lineage ?? ''}
            placeholderText={placeholderText}
            formatItemInList={formatItemInList}
        />
    );
};

function filterByInputValue(item: LineageItem, inputValue: string | null) {
    if (inputValue === null || inputValue === '') {
        return true;
    }
    return item.lineage.toLowerCase().includes(inputValue.toLowerCase() || '');
}
