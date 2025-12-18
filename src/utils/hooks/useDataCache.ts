import { useState, useEffect, useRef, useCallback } from "react";

interface UseCachedDataOptions<T> {
  fetchFn: () => Promise<T>;
  cacheKey?: string;
  dependencies?: any[];
}

/**
 * Custom hook untuk caching data dengan automatic refetch prevention
 * Mencegah re-fetch saat user kembali ke halaman (back navigation)
 */
export function useCachedData<T>({
  fetchFn,
  cacheKey,
  dependencies = [],
}: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const cacheRef = useRef<Map<string, T>>(new Map());

  const fetchData = useCallback(async () => {
    const key = cacheKey || "default";

    // Check if data already cached
    if (hasFetched.current && cacheRef.current.has(key)) {
      setData(cacheRef.current.get(key)!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      cacheRef.current.set(key, result);
      hasFetched.current = true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    hasFetched.current = false;
    cacheRef.current.clear();
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}
