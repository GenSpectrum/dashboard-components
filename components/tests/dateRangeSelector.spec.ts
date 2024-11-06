import { expect, type Page, test } from '@playwright/test';

import { toYYYYMMDD } from '../src/preact/dateRangeSelector/dateConversion';

interface DateRangeDetail {
    aDateColumnFrom: string;
    aDateColumnTo: string;
}

const getEventPromiseInsideTestBrowser = async (page: Page) => {
    return page.evaluate(() => {
        return new Promise<DateRangeDetail>((executor) => {
            document.addEventListener('gs-date-range-changed', (event) => {
                const customEvent = event as CustomEvent<DateRangeDetail>;
                return executor(customEvent.detail);
            });
        });
    });
};

test('date selector should switch to custom and back', async ({ page }) => {
    await page.goto(
        'http://localhost:6006/iframe.html?args=&id=input-daterangeselector--date-range-selector-story&viewMode=story',
    );

    const dateFrom = page.getByPlaceholder('Date from');
    const selectBox = page.locator('#root-inner').getByRole('combobox');
    const dateTo = page.getByPlaceholder('Date to');

    const firstEventPromise = getEventPromiseInsideTestBrowser(page);
    const someDateInThePast = '2021-10-01';
    await dateFrom.fill(someDateInThePast);
    await dateFrom.press('Enter');

    expect(await selectBox.inputValue()).toBe('Custom');
    expect(await dateFrom.inputValue()).toBe(someDateInThePast);

    const today = new Date();
    const firstEvent = await firstEventPromise;
    expect(firstEvent.aDateColumnFrom).toBe(someDateInThePast);
    expect(firstEvent.aDateColumnTo).toBe(toYYYYMMDD(today));

    const secondEventPromise = getEventPromiseInsideTestBrowser(page);
    await selectBox.selectOption('Last 3 months');

    const threeMonthAgo = new Date();
    threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);

    expect(await dateFrom.inputValue()).toBe(toYYYYMMDD(threeMonthAgo));
    expect(await dateTo.inputValue()).toBe(toYYYYMMDD(today));
    expect(await selectBox.inputValue()).toBe('Last 3 months');
    const secondEvent = await secondEventPromise;
    expect(secondEvent.aDateColumnFrom).toBe(toYYYYMMDD(threeMonthAgo));
    expect(secondEvent.aDateColumnTo).toBe(toYYYYMMDD(today));
});
