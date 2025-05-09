import { type FunctionComponent } from 'preact';
import z from 'zod';

import { useLapisUrl } from '../LapisUrlContext';
import { LineageFilterChangedEvent } from './LineageFilterChangedEvent';
import { fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
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
    const lapis = useLapisUrl();

    const { data, error, isLoading } = useQuery(
        () => fetchLineageAutocompleteList({ lapis, field: lapisField, lapisFilter }),
        [lapisField, lapis, lapisFilter],
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
    data: string[];
}) => {
    return (
        <DownshiftCombobox
            allItems={data}
            value={value}
            filterItemsByInputValue={filterByInputValue}
            createEvent={(item) => new LineageFilterChangedEvent({ [lapisField]: item ?? undefined })}
            itemToString={(item) => item ?? ''}
            placeholderText={placeholderText}
            formatItemInList={(item: string) => item}
        />
    );
};

function filterByInputValue(item: string, inputValue: string | null) {
    if (inputValue === null || inputValue === '') {
        return true;
    }
    return item?.toLowerCase().includes(inputValue?.toLowerCase() || '');
}
