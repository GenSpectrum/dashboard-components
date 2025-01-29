import { expect } from '@playwright/test';

import { test } from './componentsFixture';
import { getDownloadedContent } from './getDownloadedContent';
import { visualizationStories } from './visualizationStories';

visualizationStories.forEach((story) => {
    test.describe(story.title, () => {
        test(`Story ${story.id} should match screenshot`, async ({ page, storybook }) => {
            await storybook.gotoStory(story.id);
            await page.locator('.skeleton').waitFor({ state: 'hidden' });
            await expect(page.getByText(story.loadingIsDoneIndicator, { exact: true })).toBeVisible({ timeout: 15000 });
            await expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.005 });
        });

        if (story.testDownloadWithFilename !== undefined) {
            test(`Download of ${story.id} should match snapshot`, async ({ storybook }) => {
                await storybook.gotoStory(story.id);

                const download = await storybook.clickDownloadButton('Download');

                expect(download.suggestedFilename()).toBe(story.testDownloadWithFilename);
                const content = await getDownloadedContent(download);
                expect(content).toMatchSnapshot();
            });
        }
    });
});
