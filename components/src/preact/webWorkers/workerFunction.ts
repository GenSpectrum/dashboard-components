export async function workerFunction<R>(queryFunction: () => R) {
    try {
        postMessage({ status: 'loading' });

        const workerResponse = await queryFunction();

        postMessage({
            status: 'success',
            data: workerResponse,
        });
    } catch (error) {
        postMessage({ status: 'error', error });
    }
}
