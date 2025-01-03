import Choices from 'choices.js';
import { type ChoiceFull } from 'choices.js/src/scripts/interfaces/choice-full';
import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useMemo, useRef } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { type LapisLocationFilter } from './location-filter-event';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

import 'choices.js/public/assets/styles/choices.css';

const lineageFilterInnerPropsSchema = z.object({
    value: z.record(z.string().nullable()).optional(),
    placeholderText: z.string().optional(),
    fields: z.array(z.string()).min(1),
});

const lineageFilterPropsSchema = lineageFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type LocationFilterInnerProps = z.infer<typeof lineageFilterInnerPropsSchema>;
export type LocationFilterProps = z.infer<typeof lineageFilterPropsSchema>;

export const LocationFilter: FunctionComponent<LocationFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={lineageFilterPropsSchema}>
            <ResizeContainer size={size}>
                <LocationFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const LocationFilterInner = ({ value, fields, placeholderText }: LocationFilterInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(() => fetchAutocompletionList(fields, lapis), [fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }
    if (error) {
        throw error;
    }
    if (data === undefined) {
        return <NoDataDisplay />;
    }

    return <LocationSelector fields={fields} value={value} placeholderText={placeholderText} locationData={data} />;
};

type SelectItem = {
    lapisFilter: LapisLocationFilter;
    label: string;
    value: string;
    selected: boolean;
    disabled: boolean;
};

const LocationSelector = ({
    fields,
    value,
    placeholderText,
    locationData,
}: LocationFilterInnerProps & {
    locationData: LapisLocationFilter[];
}) => {
    const allItems = useMemo(
        () =>
            locationData
                .map((locationFilter) => {
                    return toSelectOption(locationFilter, fields, value);
                })
                .filter((item): item is SelectItem => item !== undefined),
        [locationData, fields, value],
    );

    const inputRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            const choices = new Choices(inputRef.current, {
                searchEnabled: true,
                removeItemButton: true,
                choices: allItems,
                placeholderValue: placeholderText,
                searchChoices: true,
                searchFields: ['value'],
                searchResultLimit: -1,

                callbackOnCreateTemplates(strToEl, escapeForTemplate, getClassNames) {
                    return {
                        choice: ({ classNames }, data: ChoiceFull) => {
                            return strToEl(`
                                  <div class="${getClassNames(classNames.item)} ${getClassNames(classNames.itemChoice)} ${getClassNames(
                                      data.disabled ? classNames.itemDisabled : classNames.itemSelectable,
                                  )}"  data-choice ${
                                      data.disabled
                                          ? 'data-choice-disabled aria-disabled="true"'
                                          : 'data-choice-selectable'
                                  } data-id="${data.id}" data-value="${escapeForTemplate(true, data.value)}" >
                                    <div>
                                      ${data.label}
                                    </div>
                                    <div>
                                      ${data.value}
                                    </div>
                                    
                                  </div>
                                `) as HTMLDivElement;
                        },
                    };
                },
                allowHTML: true,
            });

            return () => {
                choices.destroy();
            };
        }
        return () => {};
    }, [allItems, placeholderText]);

    return <select ref={inputRef} className={'input'} />;
};

function toSelectOption(locationFilter: LapisLocationFilter, fields: string[], value: LapisLocationFilter | undefined) {
    const concatenatedLocation = concatenateLocation(locationFilter, fields);

    const lastNonUndefinedValue = Object.values(locationFilter)
        .filter((value) => value !== null)
        .pop();

    if (lastNonUndefinedValue === undefined || lastNonUndefinedValue === null) {
        return undefined;
    }

    const selected = value !== undefined && concatenateLocation(value, fields) === concatenatedLocation;

    return {
        lapisFilter: locationFilter,
        label: lastNonUndefinedValue,
        value: `${concatenatedLocation}`,
        selected,
        disabled: false,
    };
}

function concatenateLocation(locationFilter: LapisLocationFilter, fields: string[]) {
    return fields
        .map((field) => locationFilter[field])
        .filter((value) => value !== null)
        .join(' / ');
}

function emptyLocationFilter(fields: string[]) {
    return fields.reduce(
        (acc, field) => {
            acc[field] = null;
            return acc;
        },
        {} as Record<string, string | null>,
    );
}
