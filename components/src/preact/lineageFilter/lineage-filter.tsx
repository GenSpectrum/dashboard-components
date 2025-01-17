import { type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';
import z from 'zod';

import { fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
import { LapisUrlContext } from '../LapisUrlContext';
import { LineageFilterChangedEvent } from './LineageFilterChangedEvent';
import { DownshiftCombobox } from '../components/downshift-combobox';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const lineageFilterInnerPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    value: z.string(),
});

const lineageFilterPropsSchema = lineageFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type LineageFilterInnerProps = z.infer<typeof lineageFilterInnerPropsSchema>;
export type LineageFilterProps = z.infer<typeof lineageFilterPropsSchema>;

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

const LineageFilterInner: FunctionComponent<LineageFilterInnerProps> = ({ lapisField, placeholderText, value }) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(
        () => fetchLineageAutocompleteList(lapis, lapisField),
        [lapisField, lapis],
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
}: LineageFilterInnerProps & {
    data: string[];
}) => {
    return (
        <DownshiftCombobox
            allItems={data}
            value={value}
            filterItemsByInputValue={filterByInputValue}
            createEvent={(item: string | null) => new LineageFilterChangedEvent({ [lapisField]: item ?? undefined })}
            itemToString={(item: string | undefined | null) => item ?? ''}
            placeholderText={placeholderText}
            formatItemInList={(item: string) => item}
        />
    );
};

function filterByInputValue(item: string, inputValue: string | undefined | null) {
    if (inputValue === undefined || inputValue === null || inputValue === '') {
        return true;
    }
    return item?.toLowerCase().includes(inputValue?.toLowerCase() || '');
}
