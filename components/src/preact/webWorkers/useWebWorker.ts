import { useEffect, useState } from 'preact/hooks';

import { UserFacingError } from '../components/error-display';

export type LoadingWorkerStatus = {
    status: 'loading';
};
export type SuccessWorkerStatus<Response> = {
    status: 'success';
    data: Response;
};
export type ErrorWorkerStatus =
    | {
          status: 'error';
          userFacing: false;
          error: Error;
      }
    | {
          status: 'error';
          userFacing: true;
          headline: string;
          error: Error;
      };
export type WorkerStatus<Response> = LoadingWorkerStatus | SuccessWorkerStatus<Response> | ErrorWorkerStatus;

export function useWebWorker<Request, Response>(messageToWorker: Request, worker: Worker) {
    const [data, setData] = useState<Response | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        worker.onmessage = (event: MessageEvent<WorkerStatus<Response>>) => {
            const eventData = event.data;
            const status = eventData.status;

            switch (status) {
                case 'loading':
                    setIsLoading(true);
                    break;
                case 'success':
                    setData(eventData.data);
                    setError(undefined);
                    setIsLoading(false);
                    break;
                case 'error':
                    setError(
                        eventData.userFacing
                            ? new UserFacingError(eventData.headline, eventData.error.message)
                            : eventData.error,
                    );
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
    }, [worker]);

    useEffect(() => {
        worker.postMessage(messageToWorker);
    }, [messageToWorker, worker]);

    return { data, error, isLoading };
}
