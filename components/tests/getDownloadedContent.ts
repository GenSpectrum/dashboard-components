import { type Download } from '@playwright/test';

export async function getDownloadedContent(download: Download) {
    const readable = await download.createReadStream();
    return await new Promise((resolve) => {
        let data = '';
        readable.on('data', (chunk) => (data += chunk));
        readable.on('end', () => resolve(data));
    });
}
