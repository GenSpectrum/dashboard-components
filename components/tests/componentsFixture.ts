import { type Page, test as base } from '@playwright/test';

class StorybookFixture {
    constructor(public readonly page: Page) {}

    public async gotoStory(id: string) {
        return this.page.goto(`http://localhost:6006/iframe.html?id=${id}`);
    }

    public async clickDownloadButton(label: string) {
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.getByText(label).click();
        return await downloadPromise;
    }
}

type ComponentsFixture = {
    storybook: StorybookFixture;
};

export const test = base.extend<ComponentsFixture>({
    storybook: async ({ page }, use) => {
        const storybook = new StorybookFixture(page);
        await use(storybook);
    },
});
