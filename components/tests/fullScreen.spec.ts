import { expect, test } from '@playwright/test';

test('component with fullscreen button exits full screen after full screen', async ({ page }) => {
    await page.goto(
        'http://localhost:6006/iframe.html?args=&id=visualization-relative-growth-advantage--default&viewMode=story',
    );

    const fullScreenButton = page.getByRole('button', { name: 'Enter fullscreen' });
    await fullScreenButton.click();

    const exitFullScreenButton = page.getByRole('button', { name: 'Exit fullscreen' });
    await exitFullScreenButton.click();

    await expect(page.getByText('Relative advantage', { exact: false })).toBeVisible();
});
