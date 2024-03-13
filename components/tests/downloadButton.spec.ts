import { test } from './componentsFixture';
import { expect } from '@playwright/test';
import { getDownloadedContent } from './getDownloadedContent';

const expectedCsv = `
field1,fieldWithEmptyValues,field2
value1_1,,5
value2_1,,42`.trim();

test.describe('Download button', () => {
    test('should download file', async ({ storybook }) => {
        await storybook.gotoStory('component-csv-download-button--download-button');

        const download = await storybook.clickDownloadButton('My Download Button');

        expect(download.suggestedFilename()).toBe('myFile.csv');

        const content = await getDownloadedContent(download);
        expect(content).toBe(expectedCsv);
    });
});
