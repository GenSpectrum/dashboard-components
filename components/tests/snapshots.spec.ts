import { expect, test } from '@playwright/test';
import { visualizationStories } from './visualizationStories';

visualizationStories.forEach((story) => {
    test(`Story ${story.id} should match screenshot`, async ({ page }) => {
        await page.goto(`http://localhost:6006/iframe.html?id=${story.id}`);
        await expect(page.getByRole('heading', { name: story.title })).toBeVisible();
        await page.getByText('Loading...', { exact: false }).waitFor({ state: 'hidden' });
        await expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.005 });
    });
});
