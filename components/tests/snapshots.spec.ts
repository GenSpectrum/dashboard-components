import { expect } from '@playwright/test';
import { test } from './componentsFixture';
import { visualizationStories } from './visualizationStories';
import { getDownloadedContent } from './getDownloadedContent';

visualizationStories.forEach((story) => {
    test.describe(story.title, () => {
        test(`Story ${story.id} should match screenshot`, async ({ page, storybook }) => {
            await storybook.gotoStory(story.id);
            await expect(page.getByRole('heading', { name: story.title })).toBeVisible();
            await page.getByText('Loading...', { exact: false }).waitFor({ state: 'hidden' });
            await expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.005 });
        });

        if (story.testDownload) {
            test(`Download of ${story.id} should match snapshot`, async ({ storybook }) => {
                await storybook.gotoStory(story.id);

                const download = await storybook.clickDownloadButton('Download');

                expect(download.suggestedFilename()).toBe('prevalence-over-time.csv');
                const content = await getDownloadedContent(download);
                expect(content).toMatchSnapshot();
            });
        }
    });
});
