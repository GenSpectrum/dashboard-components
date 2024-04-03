export const toYYYYMMDD = (date?: Date) => {
    if (!date) {
        return undefined;
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-CA', options);
};
