import { type FunctionComponent } from 'preact';
import z from 'zod';

import { useLapisUrl } from '../LapisUrlContext';
import { TextFilterChangedEvent } from './TextFilterChangedEvent';
import { fetchStringAutocompleteList } from './fetchStringAutocompleteList';
import { lapisFilterSchema } from '../../types';
import { DownshiftCombobox } from '../components/downshift-combobox';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const textSelectorPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    value: z.string().optional(),
});
const textFilterInnerPropsSchema = textSelectorPropsSchema.extend({ lapisFilter: lapisFilterSchema });
const textFilterPropsSchema = textFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type TextFilterInnerProps = z.infer<typeof textFilterInnerPropsSchema>;
export type TextFilterProps = z.infer<typeof textFilterPropsSchema>;
type TextSelectorProps = z.infer<typeof textSelectorPropsSchema>;

export const TextFilter: FunctionComponent<TextFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={textFilterPropsSchema}>
            <ResizeContainer size={size}>
                <TextFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const TextFilterInner: FunctionComponent<TextFilterInnerProps> = ({
    value,
    lapisField,
    placeholderText,
    lapisFilter,
}) => {
    const lapis = useLapisUrl();

    const { data, error, isLoading } = useQuery(
        () => fetchStringAutocompleteList({ lapis, field: lapisField, lapisFilter }),
        [lapisField, lapis, lapisFilter],
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return <TextSelector lapisField={lapisField} value={value} placeholderText={placeholderText} data={data} />;
};

type SelectItem = {
    count: number;
    value: string;
};

const TextSelector = ({
    lapisField,
    value,
    placeholderText,
    data,
}: TextSelectorProps & {
    data: SelectItem[];
}) => {
    const initialSelectedItem = data.find((candidate) => candidate.value == value);

    return (
        <DownshiftCombobox
            allItems={data}
            value={initialSelectedItem}
            filterItemsByInputValue={filterByInputValue}
            createEvent={(item: SelectItem | null) =>
                new TextFilterChangedEvent({ [lapisField]: item?.value ?? undefined })
            }
            itemToString={(item: SelectItem | undefined | null) => item?.value ?? ''}
            placeholderText={placeholderText}
            formatItemInList={(item: SelectItem) => {
                return (
                    <p>
                        <span>{item.value}</span>
                        <span className='ml-2 text-gray-500'>({item.count})</span>
                    </p>
                );
            }}
        />
    );
};

function filterByInputValue(item: SelectItem, inputValue: string | undefined | null) {
    if (inputValue === undefined || inputValue === null || inputValue === '') {
        return true;
    }
    return item.value?.toLowerCase().includes(inputValue?.toLowerCase() || '');
}
