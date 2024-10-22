import { useEffect, useMemo, useState } from 'preact/hooks';

export function useWebWorker<Request, Response>(messageToWorker: Request, worker: Worker) {
    const [data, setData] = useState<Response | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        worker.onmessage = (
            event: MessageEvent<{
                status: 'loading' | 'success' | 'error';
                data?: Response;
                error?: Error;
            }>,
        ) => {
            const { status, data, error } = event.data;

            switch (status) {
                case 'loading':
                    setIsLoading(true);
                    break;
                case 'success':
                    setData(data);
                    setError(undefined);
                    setIsLoading(false);
                    break;
                case 'error':
                    setError(error);
                    setIsLoading(false);
                    break;
                default:
                    throw new Error(`Unknown status: ${status}`);
            }
        };

        worker.onmessageerror = (event: MessageEvent) => {
            setError(new Error(`Worker received a message that it cannot deserialize: ${event.data}`));
            setIsLoading(false);
        };

        return () => {
            worker.terminate();
        };
    }, []);

    useMemo(() => {
        worker.postMessage(messageToWorker);
    }, [messageToWorker]);

    return { data, error, isLoading };
}
