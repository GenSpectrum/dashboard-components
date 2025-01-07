import { useEffect, useState } from 'preact/hooks';

export function useQuery<Data>(fetchDataCallback: () => Promise<Data>, dependencies: unknown[]) {
    const [data, setData] = useState<Data | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await fetchDataCallback();
                setData(result);
                setError(null);
            } catch (error) {
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(dependencies)]);

    if (isLoading) {
        return { isLoading: true } as const;
    }

    if (error !== null) {
        return { error, isLoading: false as const };
    }

    return { data: data!, error: null, isLoading: false as const };
}
