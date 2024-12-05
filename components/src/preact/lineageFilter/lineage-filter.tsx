import { type FunctionComponent } from 'preact';
import { useContext, useRef } from 'preact/hooks';
import z from 'zod';

import { fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const lineageFilterInnerPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    initialValue: z.string(),
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

const LineageFilterInner: FunctionComponent<LineageFilterInnerProps> = ({
    lapisField,
    placeholderText,
    initialValue,
}) => {
    const lapis = useContext(LapisUrlContext);

    const inputRef = useRef<HTMLInputElement>(null);

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

    if (data === null) {
        return <NoDataDisplay />;
    }

    const onInput = () => {
        const value = inputRef.current?.value === '' ? undefined : inputRef.current?.value;

        if (isValidValue(value)) {
            inputRef.current?.dispatchEvent(
                new CustomEvent('gs-lineage-filter-changed', {
                    detail: { [lapisField]: value },
                    bubbles: true,
                    composed: true,
                }),
            );
        }
    };

    const isValidValue = (value: string | undefined) => {
        if (value === undefined) {
            return true;
        }
        return data.includes(value);
    };

    return (
        <>
            <input
                type='text'
                class='input input-bordered w-full'
                placeholder={placeholderText !== undefined ? placeholderText : lapisField}
                onInput={onInput}
                ref={inputRef}
                list={lapisField}
                value={initialValue}
            />
            <datalist id={lapisField}>
                {data.map((item) => (
                    <option value={item} key={item} />
                ))}
            </datalist>
        </>
    );
};
