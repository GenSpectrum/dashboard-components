import { type FunctionComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import z from 'zod';

import { useLapisUrl } from '../LapisUrlContext';
import { LineageFilterChangedEvent } from './LineageFilterChangedEvent';
import { fetchLineageAutocompleteList, type LineageItem } from './fetchLineageAutocompleteList';
import { lapisFilterSchema } from '../../types';
import { DownshiftCombobox } from '../components/downshift-combobox';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const lineageSelectorPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    value: z.string(),
});
const lineageFilterInnerPropsSchema = lineageSelectorPropsSchema.extend({
    lapisFilter: lapisFilterSchema,
});
const lineageFilterPropsSchema = lineageFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type LineageFilterInnerProps = z.infer<typeof lineageFilterInnerPropsSchema>;
export type LineageFilterProps = z.infer<typeof lineageFilterPropsSchema>;
type LineageSelectorProps = z.infer<typeof lineageSelectorPropsSchema>;

export const LineageFilter: FunctionComponent<LineageFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

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

    return <LineageSelector lapisField={lapisField} value={value} placeholderText={placeholderText} data={data} />;
};

const LineageSelector = ({
    lapisField,
    value,
    placeholderText,
    data,
}: LineageSelectorProps & {
    data: LineageItem[];
}) => {
    const selectedItem = useMemo(() => {
        return data.find((item) => item.lineage === value) ?? null;
    }, [data, value]);

    return (
        <DownshiftCombobox
            allItems={data}
            value={selectedItem}
            filterItemsByInputValue={filterByInputValue}
            createEvent={(item) => new LineageFilterChangedEvent({ [lapisField]: item?.lineage ?? undefined })}
            itemToString={(item) => item?.lineage ?? ''}
            placeholderText={placeholderText}
            formatItemInList={(item: LineageItem) => (
                <p>
                    <span>{item.lineage}</span>
                    <span className='ml-2 text-gray-500'>({item.count})</span>
                </p>
            )}
        />
    );
};

function filterByInputValue(item: LineageItem, inputValue: string | null) {
    if (inputValue === null || inputValue === '') {
        return true;
    }
    return item.lineage?.toLowerCase().includes(inputValue?.toLowerCase() || '');
}
